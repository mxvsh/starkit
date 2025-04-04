export interface ActionInputs {
  githubToken: string;
  username?: string;
  readmePath: string;
  startMarker: string;
  endMarker: string;
  includeLanguages?: string[];
  excludeLanguages?: string[];
  sortBy: 'name' | 'count';
  maxRepos?: number;
  buildWeb?: boolean;
}

export interface Repository {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stargazersCount: number;
  owner: {
    login: string;
    url: string;
  };
}

export interface LanguageGroup {
  language: string;
  count: number;
  repositories: Repository[];
}

export interface ProcessedData {
  languageGroups: LanguageGroup[];
  totalCount: number;
  otherCount: number;
}

export interface ReadmeUpdateResult {
  success: boolean;
  message: string;
  updatedContent?: string;
}
