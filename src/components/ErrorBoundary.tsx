import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 bg-rose-50/90 border border-rose-200 rounded-3xl text-rose-950 shadow-sm max-w-2xl mx-auto my-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-700 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-black text-rose-900">
                {this.props.fallbackTitle || 'Display Error Encountered'}
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                A rendering issue occurred while displaying this section. Your catalog and saved data remain completely safe.
              </p>
              {this.state.error?.message && (
                <div className="p-3 bg-rose-100/60 rounded-xl text-[11px] font-mono text-rose-800 break-words">
                  {this.state.error.message}
                </div>
              )}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again / Reload View</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3 py-2 bg-white hover:bg-rose-100/80 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
