import { readFile, writeFile } from 'node:fs/promises';
import { Octokit } from 'octokit';
import type { ActionInputs, ReadmeUpdateResult } from './types';

/**
 * Handles updating the README file with generated content
 */
export class ReadmeUpdater {
  private octokit: Octokit;
  private config: ActionInputs;

  constructor(config: ActionInputs) {
    this.octokit = new Octokit({ auth: config.githubToken });
    this.config = config;
  }

  /**
   * Update README with the given content
   * @param markdownContent Generated markdown content to insert
   * @returns Result of the update operation
   */
  async updateReadme(markdownContent: string): Promise<ReadmeUpdateResult> {
    try {
      const { content: readmeContent, sha } = await this.getReadmeContent();

      const updatedContent = this.replaceSectionContent(
        readmeContent,
        markdownContent,
      );

      if (updatedContent === readmeContent) {
        return {
          success: true,
          message: 'No changes needed, README already up to date',
        };
      }

      await this.commitReadmeChanges(updatedContent, sha);

      return {
        success: true,
        message: 'README successfully updated',
        updatedContent,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to update README: ${errorMessage}`,
      };
    }
  }

  /**
   * Get the content of the README file
   */
  private async getReadmeContent(): Promise<{ content: string; sha: string }> {
    try {
      const repoPath = process.env.GITHUB_REPOSITORY || '';

      if (!repoPath) {
        throw new Error('GITHUB_REPOSITORY environment variable not set');
      }

      const [owner, repo] = repoPath.split('/');

      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: this.config.readmePath,
      });

      if (Array.isArray(response.data)) {
        throw new Error('Path does not point to a file');
      }

      if (!('content' in response.data)) {
        throw new Error('No content found in response');
      }

      const content = Buffer.from(response.data.content, 'base64').toString(
        'utf-8',
      );
      return { content, sha: response.data.sha };
    } catch (error) {
      console.log('Failed to get README from GitHub API, trying local file...');

      try {
        const content = await readFile(this.config.readmePath, 'utf-8');
        return { content, sha: '' };
      } catch (fileError) {
        console.error('Failed to read README file locally');
        throw error;
      }
    }
  }

  /**
   * Replace content between section markers
   */
  private replaceSectionContent(
    originalContent: string,
    newContent: string,
  ): string {
    const { startMarker, endMarker } = this.config;
    const startIndex = originalContent.indexOf(startMarker);
    const endIndex = originalContent.indexOf(endMarker);

    // If markers not found, append to the end
    if (startIndex === -1 || endIndex === -1) {
      console.log(
        'Section markers not found, appending to the end of the file',
      );
      return `${originalContent}\n\n${startMarker}\n${newContent}\n${endMarker}`;
    }

    // Replace content between markers
    return (
      originalContent.substring(0, startIndex + startMarker.length) +
      '\n' +
      newContent +
      '\n' +
      originalContent.substring(endIndex)
    );
  }

  /**
   * Commit changes to the README file
   */
  private async commitReadmeChanges(
    content: string,
    sha: string,
  ): Promise<void> {
    const repoPath = process.env.GITHUB_REPOSITORY || '';
    if (!repoPath) {
      await writeFile(this.config.readmePath, content, 'utf-8');
      console.log(`Changes written to local file: ${this.config.readmePath}`);
      return;
    }

    const [owner, repo] = repoPath.split('/');

    await this.octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: this.config.readmePath,
      message: 'Update starred repositories by language',
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: process.env.GITHUB_REF_NAME || 'main',
      author: {
        name: 'github-actions[bot]',
        email: 'github-actions[bot]@users.noreply.github.com',
      },
    });

    console.log('Changes committed to repository');
  }
}
