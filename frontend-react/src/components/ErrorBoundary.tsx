import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in lazy chunk or component:', error, errorInfo);
  }

  private handleRetry = () => {
    // Attempt to reload the page to fetch the latest chunks
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Oops! Something went wrong.</h2>
              <p className="text-text-secondary text-sm">
                We couldn't load this section of the application. It might be due to a poor network connection or a new version being released.
              </p>
            </div>
            <button
              onClick={this.handleRetry}
              className="w-full bg-primary hover:bg-primary-hover text-text-inverse font-bold py-3 px-6 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
