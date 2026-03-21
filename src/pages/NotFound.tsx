'use client';

import { useNavigate } from 'react-router-dom';

type ErrorType = 'route' | 'data' | 'server';

interface NotFoundProps {
  errorType?: ErrorType;
  title?: string;
  message?: string;
}

export const NotFound = ({
  errorType = 'route',
  title,
  message,
}: NotFoundProps) => {
  const navigate = useNavigate();

  const errorConfigs: Record<
    ErrorType,
    {
      title: string;
      message: string;
      statusCode: string;
      color: string;
      borderColor: string;
    }
  > = {
    route: {
      title: 'Page Not Found',
      message: 'The page you are looking for does not exist or has been moved.',
      statusCode: '404',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
    },
    data: {
      title: 'No Content Available',
      message:
        'The content you requested could not be found. It may have been deleted or is unavailable.',
      statusCode: '404',
      color: 'from-orange-500/20 to-amber-500/20',
      borderColor: 'border-orange-500/30',
    },
    server: {
      title: 'Something Went Wrong',
      message:
        'We encountered an error while loading this content. Please try again later.',
      statusCode: '500',
      color: 'from-red-500/20 to-rose-500/20',
      borderColor: 'border-red-500/30',
    },
  };

  const config = errorConfigs[errorType];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div
          className={`rounded-2xl border ${config.color} ${config.borderColor} backdrop-blur-sm shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="px-6 sm:px-8 pt-8 pb-6 text-center">
            <div className="text-6xl font-mono text-zinc-500 mb-2">
              {config.statusCode}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 pb-8 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {displayTitle}
              </h1>
              <p className="text-sm sm:text-base text-zinc-400">
                {displayMessage}
              </p>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => navigate('/home')}
              className="flex-1 px-4 py-2.5 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-200 font-medium text-sm"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
