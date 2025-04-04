import React from 'react';
import type { Repository } from '../../lib/types';
import { StarIcon } from 'lucide-react';

interface RepositoryCardProps {
  repository: Repository;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  // Generate a language badge color based on language name
  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-gray-200 text-gray-800';

    // Simple hash function to generate consistent colors
    const hash = Array.from(language).reduce(
      (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash),
      0,
    );

    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <a
          href={repository.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-blue-600 hover:underline"
        >
          {repository.name}
        </a>
        <div className="flex items-center text-sm text-gray-600 space-x-0.5">
          <StarIcon size={16} />
          <span>{repository.stargazersCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="mb-3">
        <a
          href={repository.owner.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:underline"
        >
          {repository.owner.login}
        </a>
      </div>

      {repository.description && (
        <p className="text-gray-700 mb-4 line-clamp-2">
          {repository.description}
        </p>
      )}

      {repository.language && (
        <div className="flex items-center mt-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLanguageColor(
              repository.language,
            )}`}
          >
            {repository.language}
          </span>
        </div>
      )}
    </div>
  );
};

export default RepositoryCard;
