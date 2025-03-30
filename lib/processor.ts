import type {
  Repository,
  LanguageGroup,
  ProcessedData,
  ActionInputs,
} from './types';

/**
 * Processes repository data to group by language
 */
export class RepoProcessor {
  private config: ActionInputs;

  constructor(config: ActionInputs) {
    this.config = config;
  }

  /**
   * Group repositories by language and apply filtering/sorting
   * @param repositories List of repositories to process
   * @returns Processed data with language grouping
   */
  processRepositories(repositories: Repository[]): ProcessedData {
    const languageMap = new Map<string, Repository[]>();
    let otherCount = 0;

    for (const repo of repositories) {
      const language = repo.language || 'Unknown';

      if (this.shouldSkipLanguage(language)) {
        otherCount++;
        continue;
      }

      if (!languageMap.has(language)) {
        languageMap.set(language, []);
      }

      languageMap.get(language)!.push(repo);
    }

    const languageGroups: LanguageGroup[] = Array.from(
      languageMap.entries(),
    ).map(([language, repos]) => ({
      language,
      count: repos.length,
      repositories: this.limitRepositories(repos),
    }));

    this.sortLanguageGroups(languageGroups);

    return {
      languageGroups,
      totalCount: repositories.length,
      otherCount,
    };
  }

  /**
   * Check if a language should be skipped based on include/exclude filters
   * @param language Language to check
   * @returns Whether the language should be skipped
   */
  private shouldSkipLanguage(language: string): boolean {
    if (this.config.includeLanguages?.length) {
      return !this.config.includeLanguages.includes(language);
    }

    if (this.config.excludeLanguages?.length) {
      return this.config.excludeLanguages.includes(language);
    }

    return false;
  }

  /**
   * Limit the number of repositories per language if maxRepos is set
   * @param repositories List of repositories
   * @returns Limited list of repositories
   */
  private limitRepositories(repositories: Repository[]): Repository[] {
    if (!this.config.maxRepos) return repositories;

    return [...repositories]
      .sort((a, b) => b.stargazersCount - a.stargazersCount)
      .slice(0, this.config.maxRepos);
  }

  /**
   * Sort language groups based on config
   * @param languageGroups Array of language groups to sort
   */
  private sortLanguageGroups(languageGroups: LanguageGroup[]): void {
    if (this.config.sortBy === 'count') {
      languageGroups.sort((a, b) => b.count - a.count);
    } else {
      languageGroups.sort((a, b) => a.language.localeCompare(b.language));
    }
  }

  /**
   * Generate markdown content from processed data
   * @param data Processed repository data
   * @returns Markdown string
   */
  generateMarkdown(data: ProcessedData): string {
    let markdown = `## Starred Repositories by Language\n\n`;
    markdown += `*Total: ${data.totalCount} repositories across ${data.languageGroups.length} languages*\n\n`;

    for (const group of data.languageGroups) {
      markdown += `### ${group.language} (${group.count})\n\n`;

      for (const repo of group.repositories) {
        const description = repo.description ? ` - ${repo.description}` : '';

        markdown += `- [${repo.fullName}](${repo.url})${description}\n`;
      }

      markdown += '\n';
    }

    if (data.otherCount > 0) {
      markdown += `*Note: ${data.otherCount} repositories were filtered out based on language preferences.*\n\n`;
    }

    return markdown;
  }
}
