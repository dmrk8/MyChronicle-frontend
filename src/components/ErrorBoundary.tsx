import React, { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-900 via-black to-zinc-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-red-500/30 bg-linear-to-br from-red-500/20 to-rose-500/20 backdrop-blur-sm shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-8 pb-6 text-center">
            <div className="text-7xl sm:text-8xl mb-4">??</div>
            <div className="text-xs font-mono text-zinc-500 mb-2">ERROR</div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 pb-8 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Something Went Wrong
              </h1>
              <p className="text-sm sm:text-base text-zinc-400">
                We encountered an unexpected error. Please try refreshing or
                returning home.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && error && (
              <div className="pt-4 border-t border-zinc-600">
                <p className="text-xs font-mono text-red-400 wrap-break-word">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 sm:px-8 pb-8 flex gap-3 flex-col sm:flex-row">
            <button
              onClick={onReset}
              className="flex-1 px-4 py-3 bg-zinc-700/50 hover:bg-zinc-600 border border-zinc-600 text-white rounded-lg transition-all duration-200 font-medium text-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-blue-500/20"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
