import React, { useEffect, useState } from 'react';
import { useAnilistMediaDetail } from '../hooks/useAnilistQueries';

interface MediaDetailsProps {
  mediaId: number;
  onBack: () => void;
}

function stripHtml(input?: string | null) {
  if (!input) return '';
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
}

const MediaDetails = ({ mediaId, onBack }: MediaDetailsProps) => {
  const { data, isLoading, isError } = useAnilistMediaDetail(mediaId);

  if (isLoading)
    return <div className="p-10 text-center">Loading details...</div>;

  if (isError || !data) {
    return (
      <div className="container mx-auto p-4">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-black"
        >
          &larr; Back
        </button>
        <div className="text-center text-red-500 py-10">
          Failed to load media details.
        </div>
      </div>
    );
  }

  const description = stripHtml(data.description);

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-black"
      >
        &larr; Back
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {data.coverImage && (
            <img
              src={data.coverImage}
              alt={data.title}
              className="w-52 rounded-md self-start"
              loading="lazy"
            />
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2 dark:text-white">
              {data.title}
            </h1>

            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {data.format ? (
                <span className="mr-3">Format: {data.format}</span>
              ) : null}
              {typeof data.averageScore === 'number' ? (
                <span className="mr-3">Score: {data.averageScore}</span>
              ) : null}
              {data.status ? <span>Status: {data.status}</span> : null}
            </div>

            {description ? (
              <p className="whitespace-pre-line text-gray-800 dark:text-gray-100">
                {description}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No description.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;
