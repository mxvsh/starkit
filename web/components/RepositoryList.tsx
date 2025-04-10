import React from 'react';
import RepositoryCard from './RepositoryCard';
import type { Repository } from '../../lib/types';

interface RepositoryListProps {
  repositories: Repository[];
}

const RepositoryList: React.FC<RepositoryListProps> = ({ repositories }) => {
  if (repositories.length === 0) {
    return (
      <div className="rounded-lg shadow-md p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-600">
          No repositories found
        </h2>
        <p className="mt-2 text-gray-500">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-x divide-y overflow-auto h-full">
      {repositories.map((repo, index) => (
        <RepositoryCard
          key={repo.fullName}
          repository={repo}
          className={
            index === repositories.length - 1 ? 'border-r border-b' : ''
          }
        />
      ))}
    </div>
  );
};

export default RepositoryList;
