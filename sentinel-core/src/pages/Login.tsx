import { useState } from 'react'
import { useAuth } from '../AuthProvider'

const DEMO_USERS = [
  { name: 'Jim Andrews', email: 'jim@jettylight.com', role: 'Admin', org: 'Ops Normal' },
  { name: 'Cam', email: 'cam@jettylight.com', role: 'Admin', org: 'Ops Normal' },
  { name: 'Eric Bardot', email: 'ebardot@standingtide.com', role: 'Admin', org: 'Standing Tide' },
  { name: 'Sam Kelley', email: 'skelley@standingtide.com', role: 'Vessel Admin', org: 'Standing Tide' },
  { name: 'Kelly Paulson', email: 'kpaulson@standingtide.com', role: 'Finance', org: 'Standing Tide' },
]

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const { error: err } = await signIn(email, password)
    if (err) setError(err.message)
    setLoading(false)
  }

  async function quickLogin(em: string) {
    setError(''); setLoading(true)
    const { error: err } = await signIn(em, 'BenderBoat2026!')
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚓</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SENTINEL-CORE</h1>
          <p className="text-slate-400 mt-1">Vessel Operations & Crew Management</p>
          <p className="text-xs text-slate-500 mt-1">Ops Normal AI LLC</p>
        </div>
        <form onSubmit={handleLogin} className="bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-3 text-center">Quick Access</p>
          <div className="grid gap-2">
            {DEMO_USERS.map(u => (
              <button key={u.email} onClick={() => quickLogin(u.email)} disabled={loading}
                className="flex items-center justify-between px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-left group disabled:opacity-50">
                <div>
                  <span className="text-sm text-white font-medium">{u.name}</span>
                  <span className="text-xs text-slate-500 ml-2">{u.org}</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-slate-600 text-slate-300 rounded">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-6">Press <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-500">⌘K</kbd> after login to search anything</p>
      </div>
    </div>
  )
}
