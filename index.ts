#!/usr/bin/env bun

import { loadConfig } from './lib/config';
import { StarredReposFetcher } from './lib/fetcher';
import { RepoProcessor } from './lib/processor';
import { ReadmeUpdater } from './lib/readme-updater';
import { WebBuilder } from './lib/web-builder';

/**
 * Main function to run the GitHub Action
 */
async function main() {
  try {
    console.log('Starting Starred Repositories Categorizer...');

    const config = loadConfig();
    console.log('Configuration loaded successfully');

    const fetcher = new StarredReposFetcher(
      config.githubToken,
      config.username,
    );
    const repositories = await fetcher.fetchStarredRepos();

    if (repositories.length === 0) {
      console.log('No starred repositories found');
      return;
    }

    const processor = new RepoProcessor(config);
    const processedData = processor.processRepositories(repositories);
    const markdown = processor.generateMarkdown(processedData);

    const updater = new ReadmeUpdater(config);
    const result = await updater.updateReadme(markdown);

    if (result.success) {
      console.log(`Success: ${result.message}`);
    } else {
      console.error(`Error: ${result.message}`);
      process.exit(1);
    }

    // Build web app if enabled
    if (config.buildWeb) {
      console.log('Building web application...');
      const webBuilder = new WebBuilder(repositories, config);
      const buildSuccess = await webBuilder.buildWebApp();

      if (buildSuccess) {
        console.log('Web application built successfully!');
      } else {
        console.error('Web application build failed.');
      }
    }
  } catch (error) {
    console.error('An unexpected error occurred:');
    console.error(error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
