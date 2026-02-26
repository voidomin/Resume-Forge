import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-red-50 p-6 rounded-2xl max-w-md border border-red-100 shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              A rendering error occurred in this module. We've logged the issue.
            </p>
            <button
              onClick={() => globalThis.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Application
            </button>
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 text-left bg-red-950 rounded p-3 overflow-x-auto">
                <p className="text-xs text-red-200 font-mono whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
