import React from 'react';

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
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Search</h2>
        <input
          type="text"
          placeholder="Search repositories..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Languages</h2>
          {selectedLanguage && (
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => onSelectLanguage(null)}
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto">
          <button
            className={`w-full text-left px-2 py-1 rounded-md ${
              !selectedLanguage
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelectLanguage(null)}
          >
            All Languages ({totalRepos})
          </button>

          {languages.sort().map(language => (
            <button
              key={language}
              className={`w-full text-left px-2 py-1 rounded-md ${
                selectedLanguage === language
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onSelectLanguage(language)}
            >
              {language}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {filteredCount} of {totalRepos} repositories
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
