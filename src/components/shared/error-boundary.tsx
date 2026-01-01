'use client';

import { Component, type ReactNode } from 'react';
import { ErrorDisplay } from './error-display';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <ErrorDisplay
            title="Une erreur inattendue est survenue"
            message="L'application a rencontré un problème. Essayez de recharger la page."
            code={this.props.showDetails ? this.state.error?.name : undefined}
            onRetry={this.handleRetry}
            showBack={false}
            showHome={true}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for easier use with function components
interface WithErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary
        fallback={options.fallback}
        onError={options.onError}
        showDetails={options.showDetails}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
