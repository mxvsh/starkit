import { build } from 'vite';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import type { Repository, ActionInputs } from './types';
import { write } from 'bun';

export class WebBuilder {
  private repositories: Repository[];
  private config: ActionInputs;

  constructor(repositories: Repository[], config: ActionInputs) {
    this.repositories = repositories;
    this.config = config;
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
      }

      // Build using Vite API
      await build({
        root: join(process.cwd(), 'web'),
        base: './', // Use relative paths for GitHub Pages
        build: {
          outDir: '../dist',
          emptyOutDir: true,
          minify: true,
        },
        plugins: [tailwindcss()],
        define: {
          'import.meta.env.REPOS': JSON.stringify(this.repositories),
        },
      });

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
   * Check if web app should be built based on configuration
   */
  private shouldBuildWeb(): boolean {
    // Check for an environment variable or config property
    return (
      process.env.BUILD_WEB === 'true' || this.config.buildWeb === true || false
    );
  }
}
