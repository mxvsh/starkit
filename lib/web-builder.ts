import { build } from 'vite';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Octokit } from 'octokit';
import type { Repository, ActionInputs } from './types';
import { write } from 'bun';
import tailwindcss from '@tailwindcss/vite';

export class WebBuilder {
  private repositories: Repository[];
  private config: ActionInputs;
  private octokit: Octokit;

  constructor(repositories: Repository[], config: ActionInputs) {
    this.repositories = repositories;
    this.config = config;
    this.octokit = new Octokit({ auth: config.githubToken });
  }

  /**
   * Build the web application using Vite API
   */
  async buildWebApp(): Promise<boolean> {
    try {
      // Check if web build is enabled
      if (!this.shouldBuildWeb()) {
        console.log('Web build is disabled. Skipping...');
        return false;
      }

      console.log('Building web application with Vite...');

      // Ensure the dist directory exists
      const distDir = join(process.cwd(), 'dist');
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
        console.log(`Created dist directory at: ${distDir}`);
      }

      // Log the current directory structure for debugging
      console.log('Current directory structure:');
      console.log('Working directory:', process.cwd());

      // Build using Vite API
      await build({
        root: join(process.cwd(), 'web'),
        base: './', // Use relative paths for GitHub Pages
        build: {
          outDir: join(process.cwd(), 'dist'),
          emptyOutDir: true,
          minify: true,
        },
        define: {
          'import.meta.env.REPOS': JSON.stringify(this.repositories),
        },
        plugins: [tailwindcss()],
      });

      // Verify the build output
      console.log(`Checking dist directory contents at: ${distDir}`);
      if (existsSync(distDir)) {
        const files = readdirSync(distDir);
        console.log('Dist directory contents:', files);

        // Deploy to GitHub Pages if in GitHub Actions environment
        if (process.env.GITHUB_REPOSITORY) {
          const deployed = await this.deployToGitHubPages(distDir);
          if (deployed) {
            console.log('Successfully deployed to GitHub Pages');
          } else {
            console.error('Failed to deploy to GitHub Pages');
          }
        }
      } else {
        console.log('Warning: dist directory not found after build');
      }

      if (process.env.GENERATE_REPO_JSON) {
        await write(join('repos.json'), JSON.stringify(this.repositories));
      }

      console.log('Web application built successfully in dist/ directory');
      return true;
    } catch (error) {
      console.error('Failed to build web application:', error);
      return false;
    }
  }

  /**
   * Deploy built files to GitHub Pages
   */
  private async deployToGitHubPages(distDir: string): Promise<boolean> {
    try {
      console.log('Deploying to GitHub Pages...');
      const repoPath = process.env.GITHUB_REPOSITORY || '';

      if (!repoPath) {
        console.log('Not in GitHub Actions environment, skipping deployment');
        return false;
      }

      const [owner, repo] = repoPath.split('/');

      // Get reference to gh-pages branch or create it if it doesn't exist
      let shaGhPages: string;
      try {
        // Try to get the gh-pages branch
        const { data: reference } = await this.octokit.rest.git.getRef({
          owner,
          repo,
          ref: 'heads/gh-pages',
        });

        shaGhPages = reference.object.sha;
        console.log('Found existing gh-pages branch');
      } catch (error) {
        // Branch doesn't exist, create it
        console.log('gh-pages branch not found, creating it...');
        // Get default branch to base the new branch on
        const { data: repository } = await this.octokit.rest.repos.get({
          owner,
          repo,
        });

        const defaultBranch = repository.default_branch;
        const { data: mainRef } = await this.octokit.rest.git.getRef({
          owner,
          repo,
          ref: `heads/${defaultBranch}`,
        });

        // Create a gh-pages branch
        await this.octokit.rest.git.createRef({
          owner,
          repo,
          ref: 'refs/heads/gh-pages',
          sha: mainRef.object.sha,
        });

        shaGhPages = mainRef.object.sha;
        console.log('Created gh-pages branch');
      }

      // Create a tree with all the files in the dist directory
      console.log('Creating tree with build files...');

      // Get all files recursively
      const allFiles = await this.getAllFiles(distDir);
      console.log(`Found ${allFiles.length} files to deploy`);

      const blobs = await Promise.all(
        allFiles.map(async filePath => {
          try {
            // Get relative path for GitHub Pages
            const relativePath = filePath
              .substring(distDir.length + 1)
              .replace(/\\/g, '/');

            // Read file content as Buffer
            const content = await readFile(filePath);

            // Create a blob for each file
            const { data: blob } = await this.octokit.rest.git.createBlob({
              owner,
              repo,
              content: content.toString('base64'),
              encoding: 'base64',
            });

            return {
              path: relativePath,
              mode: '100644' as const, // Regular file with correct type
              type: 'blob' as const,
              sha: blob.sha,
            };
          } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
            return null;
          }
        }),
      );

      // Filter out any null results from errors
      const validBlobs = blobs.filter(blob => blob !== null);

      // Create a tree
      const { data: tree } = await this.octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: shaGhPages,
        tree: validBlobs,
      });

      // Create a commit
      const { data: commit } = await this.octokit.rest.git.createCommit({
        owner,
        repo,
        message: 'Update GitHub Pages with latest web build',
        tree: tree.sha,
        parents: [shaGhPages],
        author: {
          name: 'github-actions[bot]',
          email: 'github-actions[bot]@users.noreply.github.com',
        },
      });

      // Update the gh-pages branch to point to the new commit
      await this.octokit.rest.git.updateRef({
        owner,
        repo,
        ref: 'heads/gh-pages',
        sha: commit.sha,
        force: true,
      });

      console.log('GitHub Pages deployment completed successfully');
      return true;
    } catch (error) {
      console.error('Failed to deploy to GitHub Pages:', error);
      return false;
    }
  }

  /**
   * Get all files recursively from a directory
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const { promises: fs } = require('fs');
    const { join } = require('path');

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      const files = await Promise.all(
        entries.map(async (entry: any) => {
          const path = join(dir, entry.name);
          if (entry.isDirectory()) {
            return await this.getAllFiles(path);
          }
          return path;
        }),
      );

      // Flatten the array of arrays
      return files.flat();
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
      return [];
    }
  }

  /**
   * Check if web app should be built based on configuration
   */
  private shouldBuildWeb(): boolean {
    // Check for an environment variable or config property
    return (
      process.env.BUILD_WEB === 'true' || this.config.buildWeb === true || false
    );
  }
}
