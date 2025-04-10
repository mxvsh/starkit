import React from 'react';
import { Button } from './ui/Button';

interface SidebarProps {
  languages: string[];
  selectedLanguage: string | null;
  onSelectLanguage: (language: string | null) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  totalRepos: number;
  filteredCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  languages,
  selectedLanguage,
  onSelectLanguage,
  searchTerm,
  onSearchChange,
  totalRepos,
  filteredCount,
}) => {
  return (
    <div className="sticky top-20 px-2 py-4 min-w-60 w-60 overflow-auto h-[calc(100dvh-5rem)]">
      <div className="">
        <h1 className="uppercase text-xs mb-2 pl-4">Languages</h1>
        <Button
          onClick={() => onSelectLanguage(null)}
          variant={!selectedLanguage ? 'default' : 'ghost'}
        >
          All Languages
        </Button>

        {languages.sort().map(language => (
          <Button
            key={language}
            onClick={() => onSelectLanguage(language)}
            variant={selectedLanguage === language ? 'default' : 'ghost'}
          >
            {language}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
