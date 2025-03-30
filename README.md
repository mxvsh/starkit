<img src="./starkit.svg" alt="starkit" />

A GitHub Action that automatically updates your README with a list of repositories you've starred on GitHub, categorized by programming language.

## Usage

### Basic Setup

Add this to your workflow file (e.g., `.github/workflows/update-stars.yml`):

```yml
name: Update Starred Repositories

on:
  schedule:
    - cron: '5 4 * * *'   # Run daily at 4:05 AM
  workflow_dispatch:      # Allow manual trigger

jobs:
  update-stars:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - name: Update README with Starred Repositories
        uses: mxvsh/starkit@v1.3.2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          github-username: ${{ github.actor }}
```

### Configurations

You can use markers to identify the section of your README that you want to update.

```md
# My Starred Repositories

<!-- STARRED_REPOS_START -->

<!-- STARRED_REPOS_END -->
```

You can customize the action by passing additional parameters:

- `readme-path`: Path to your README file (default: `README.md`)
- `start-marker`: Marker to identify section start (default: `<!-- STARRED_REPOS_START -->`)
- `end-marker`: Marker to identify section end (default: `<!-- STARRED_REPOS_END -->`)
- `include-languages`: Comma-separated list of languages to include (optional)
- `exclude-languages`: Comma-separated list of languages to exclude (optional)
- `sort-by`: Sort order (`name` or `count`, default: `name`)
- `max-repos`: Maximum number of repositories per language (optional)


## Feature Roadmap

- [ ] Custom badges for each language
- [ ] Categorize by repository topics
- [ ] Group by organization/owner
- [ ] Filter by creation/update date
- [ ] Collapsible sections by language

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Credits

This project is inspired by [stargazer](https://github.com/rverst/stargazer).
