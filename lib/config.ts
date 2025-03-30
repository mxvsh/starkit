import type { ActionInputs } from './types';

/**
 * Gets input from GitHub Action environment variables
 * @param name The name of the input
 * @param required Whether the input is required
 * @param defaultValue The default value for the input
 * @returns The input value
 */
function getInput(
  envName: string,
  required = false,
  defaultValue = '',
): string {
  const value = process.env[envName] || defaultValue;

  if (required && !value) {
    throw new Error(`Input required and not supplied: ${name}`);
  }

  return value;
}

/**
 * Parse comma-separated string into array
 * @param value Comma-separated string
 * @returns Array of strings or undefined if empty
 */
function parseArrayInput(value: string): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

/**
 * Load configuration from environment variables
 * @returns Parsed action inputs
 */
export function loadConfig(): ActionInputs {
  const githubToken = getInput('GITHUB_TOKEN', true);
  const username = getInput('GITHUB_USERNAME');
  const readmePath = getInput('README_PATH', false, 'README.md');
  const startMarker = getInput(
    'START_MARKER',
    false,
    '<!-- STARRED_REPOS_START -->',
  );
  const includeLanguagesStr = getInput('INCLUDE_LANGUAGES');
  const excludeLanguagesStr = getInput('EXCLUDE_LANGUAGES');
  const sortBy = getInput('SORT_BY', false, 'name') as 'name' | 'count';
  const maxReposStr = getInput('MAX_REPOS');

  return {
    githubToken,
    username: username || undefined,
    readmePath,
    startMarker,
    includeLanguages: parseArrayInput(includeLanguagesStr),
    excludeLanguages: parseArrayInput(excludeLanguagesStr),
    sortBy: ['name', 'count'].includes(sortBy) ? sortBy : 'name',
    maxRepos: maxReposStr ? parseInt(maxReposStr, 10) : undefined,
  };
}
