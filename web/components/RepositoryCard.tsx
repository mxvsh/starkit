import React from 'react';
import type { Repository } from '../../lib/types';
import { StarIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface RepositoryCardProps {
  repository: Repository;
  className?: string;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  className,
}) => {
  // Generate a language badge color based on language name
  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-gray-200 text-gray-800';

    // Simple hash function to generate consistent colors
    const hash = Array.from(language).reduce(
      (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash),
      0,
    );

    const colors = [
      'bg-pink-900 text-pink-100',
      'bg-red-900 text-red-100',
      'bg-purple-900 text-purple-100',
      'bg-green-900 text-green-100',
      'bg-indigo-900 text-indigo-100',
      'bg-blue-900 text-blue-100',
      'bg-yellow-900 text-yellow-100',
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-start p-4 hover:bg-muted-foreground/10 transition-colors',
        className,
      )}
    >
      <a
        href={repository.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg font-semibold hover:underline"
      >
        {repository.name}
      </a>

      <div className="absolute top-4 right-4 flex text-sm text-muted-foreground space-x-0.5">
        <StarIcon size={16} />
        <span>{repository.stargazersCount.toLocaleString()}</span>
      </div>

      <div className="mb-3">
        <a
          href={repository.owner.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:underline"
        >
          {repository.owner.login}
        </a>
      </div>

      {repository.description && (
        <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
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
