import { Octokit } from 'octokit';
import type { Repository } from './types';

/**
 * Fetches starred repositories for a GitHub user
 */
export class StarredReposFetcher {
  private octokit: Octokit;
  private username: string;

  constructor(token: string, username?: string) {
    console.debug('Initializing Octokit with username: ', username);
    this.octokit = new Octokit({ auth: token });
    this.username = username || '';
  }

  /**
   * Fetch the authenticated user if username is not provided
   */
  private async getCurrentUser(): Promise<string> {
    if (this.username) return this.username;

    const { data } = await this.octokit.rest.users.getAuthenticated();
    this.username = data.login;
    return this.username;
  }

  /**
   * Fetch all starred repositories for the user
   * @returns Array of repositories
   */
  async fetchStarredRepos(): Promise<Repository[]> {
    const username = await this.getCurrentUser();
    const repositories: Repository[] = [];
    let page = 1;
    const perPage = 100;
    let hasMorePages = true;

    console.log(`Fetching starred repositories for ${username}...`);

    while (hasMorePages) {
      try {
        const response =
          await this.octokit.rest.activity.listReposStarredByUser({
            username,
            per_page: perPage,
            page,
          });

        if (response.data.length === 0) {
          hasMorePages = false;
          break;
        }

        for (const repo of response.data) {
          if (typeof repo === 'object' && 'id' in repo) {
            repositories.push({
              name: repo.name,
              fullName: repo.full_name,
              description: repo.description,
              url: repo.html_url,
              language: repo.language,
              stargazersCount: repo.stargazers_count,
              owner: {
                login: repo.owner.login,
                url: repo.owner.html_url,
              },
            });
          }
        }

        page++;

        console.log(
          `Fetched page ${page - 1}, found ${
            repositories.length
          } repositories so far...`,
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Error fetching starred repositories: ${error.message}`,
          );
          if ((error as any).status === 403) {
            console.error(
              'Rate limit exceeded. Try again later or use a token with higher rate limits.',
            );
          }
        }
        hasMorePages = false;
        break;
      }
    }

    console.log(
      `Found a total of ${repositories.length} starred repositories for ${username}`,
    );
    return repositories;
  }
}
