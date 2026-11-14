import React from 'react';

export const MovieCardSkeleton = () => {
  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-surface-border animate-pulse">
      <div className="aspect-[2/3] bg-surface-light w-full"></div>
      <div className="p-4 space-y-3">
        <div className="h-3 bg-surface-light rounded w-1/3"></div>
        <div className="h-5 bg-surface-light rounded w-3/4"></div>
        <div className="h-3 bg-surface-light rounded w-1/2 pt-2"></div>
      </div>
    </div>
  );
};

export const MovieGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
};

