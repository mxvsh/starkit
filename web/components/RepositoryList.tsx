import React from 'react';
import RepositoryCard from './RepositoryCard';
import type { Repository } from '../../lib/types';

interface RepositoryListProps {
  repositories: Repository[];
}

const RepositoryList: React.FC<RepositoryListProps> = ({ repositories }) => {
  if (repositories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
    <div className="bg-white rounded-lg shadow-md p-4 overflow-auto max-h-screen">
      <h2 className="text-xl font-semibold mb-4">
        Repositories ({repositories.length})
      </h2>
      <div className="space-y-4">
        {repositories.map(repo => (
          <RepositoryCard key={repo.fullName} repository={repo} />
        ))}
      </div>
    </div>
  );
};

export default RepositoryList;
