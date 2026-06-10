import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-red-400" />
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Terjadi Kesalahan
          </h1>

          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            Halaman yang kamu tuju mengalami masalah. Coba muat ulang atau kembali ke dashboard.
          </p>

          {this.state.error && (
            <pre className="text-xs text-left text-red-300/70 bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-8 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all"
            >
              <RefreshCw size={14} /> Muat Ulang
            </button>

            <Link
              to="/dashboard"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
            >
              <Home size={14} /> Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
