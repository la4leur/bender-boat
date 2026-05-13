import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword('BenderBoat2026!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Sentinel-Core</h1>
          <p className="text-blue-300 mt-1">Vessel Operations Platform</p>
          <p className="text-slate-400 text-sm mt-1">by Ops Normal AI LLC</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@standingtide.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••••" required />
            </div>
            {error && <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 mb-3 text-center">Demo Quick Access</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { email: 'jim@jettylight.com', name: 'Jim Andrews', role: 'Admin' },
                { email: 'cam@jettylight.com', name: 'Cam', role: 'Admin' },
                { email: 'ebardot@standingtide.com', name: 'Eric Bardot', role: 'Admin' },
                { email: 'skelley@standingtide.com', name: 'Sam Kelley', role: 'Vessel Admin' },
                { email: 'kpaulson@standingtide.com', name: 'Kelly Paulson', role: 'Finance' },
              ].map(u => (
                <button key={u.email} onClick={() => quickLogin(u.email)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-blue-200 transition-colors text-left">
                  <span className="font-medium">{u.name}</span> <span className="text-slate-400">— {u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-slate-500 text-xs mt-6">&copy; 2026 Ops Normal AI LLC</p>
      </div>
    </div>
  );
}
