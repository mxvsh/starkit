import type { ActionInputs } from './types';

/**
 * Gets input from GitHub Action environment variables
 * @param name The name of the input
 * @param required Whether the input is required
 * @param defaultValue The default value for the input
 * @returns The input value
 */
function getInput(name: string, required = false, defaultValue = ''): string {
  const envName = `INPUT_${name.toUpperCase().replace(/-/g, '_')}`;
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
  const githubToken = getInput('github-token', true);
  const username = getInput('github-username', true);
  const readmePath = getInput('readme-path', false, 'README.md');
  const startMarker = getInput(
    'start-marker',
    false,
    '<!-- STARRED_REPOS_START -->',
  );
  const endMarker = getInput('end-marker', false, '<!-- STARRED_REPOS_END -->');
  const includeLanguagesStr = getInput('include-languages');
  const excludeLanguagesStr = getInput('exclude-languages');
  const sortBy = getInput('sort-by', false, 'name') as 'name' | 'count';
  const maxReposStr = getInput('max-repos');
  const buildWebStr = getInput('build-web', false, 'false');

  return {
    githubToken,
    username: username || undefined,
    readmePath,
    startMarker,
    endMarker,
    includeLanguages: parseArrayInput(includeLanguagesStr),
    excludeLanguages: parseArrayInput(excludeLanguagesStr),
    sortBy: ['name', 'count'].includes(sortBy) ? sortBy : 'name',
    maxRepos: maxReposStr ? parseInt(maxReposStr, 10) : undefined,
    buildWeb: buildWebStr.toLowerCase() === 'true',
  };
}
