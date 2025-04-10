import './global.css';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RepositoryList from './components/RepositoryList';
import type { Repository } from '../lib/types';
import Header from './components/Header';

function App() {
  const [repositories] = useState<Repository[]>(
    (import.meta.env.REPOS as unknown as Repository[]) || [],
  );
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter repositories based on selected language and search term
  useEffect(() => {
    let filtered = [...repositories];

    if (selectedLanguage) {
      filtered = filtered.filter(repo => repo.language === selectedLanguage);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        repo =>
          repo.name.toLowerCase().includes(term) ||
          (repo.description && repo.description.toLowerCase().includes(term)),
      );
    }

    setFilteredRepos(filtered);
  }, [repositories, selectedLanguage, searchTerm]);

  // Get unique languages
  const languages = [
    ...new Set(repositories.map(repo => repo.language).filter(Boolean)),
  ];

  return (
    <div>
      <Header />
      <div className="flex items-start divide-x">
        <Sidebar
          languages={languages as string[]}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalRepos={repositories.length}
          filteredCount={filteredRepos.length}
        />
        <RepositoryList repositories={filteredRepos} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      <main className="container mx-auto py-6 px-4 flex flex-col md:flex-row gap-6">
        {/* Sidebar with filters (30% width on medium screens and larger) */}
        <div className="w-full md:w-3/10 md:max-w-xs">
          <Sidebar
            languages={languages as string[]}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalRepos={repositories.length}
            filteredCount={filteredRepos.length}
          />
        </div>

        {/* Content area (70% width on medium screens and larger) */}
        <div className="w-full md:w-7/10 flex-1">
          <RepositoryList repositories={filteredRepos} />
        </div>
      </main>

      <footer className="bg-gray-200 p-4 text-center text-sm text-gray-600">
        Built with{' '}
        <a className="font-bold" href="https://github.com/mxvsh/starkit">
          Starkit
        </a>{' '}
        - GitHub Starred Repository Kit
      </footer>
    </div>
  );
}

export default App;
