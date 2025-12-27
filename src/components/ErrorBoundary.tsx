import React from 'react';

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch() {
    // Intentionally no console spam; UI shows error.
  }

  private handleReload = () => {
    try {
      this.props.onReset?.();
    } finally {
      window.location.reload();
    }
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const title = this.props.fallbackTitle ?? 'Something went wrong';

    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="w-full max-w-xl rounded-xl border border-red-200 bg-white p-5">
          <div className="text-sm font-semibold text-red-600">{title}</div>
          <div className="mt-2 text-sm text-slate-700">{String(error?.message || error)}</div>
          <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100 whitespace-pre-wrap">
            {String((error as any)?.stack || '')}
          </pre>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900"
              onClick={this.handleReload}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
