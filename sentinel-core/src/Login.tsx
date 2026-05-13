import { useState } from 'react'
import { supabase } from './supabase'

const DEMO_USERS = [
  { label: 'Jim Andrews', sub: 'Admin — Ops Normal', email: 'jim@jettylight.com' },
  { label: 'Cam', sub: 'Admin — Ops Normal', email: 'cam@jettylight.com' },
  { label: 'Eric Bardot', sub: 'Admin — Standing Tide', email: 'ebardot@standingtide.com' },
  { label: 'Sam Kelley', sub: 'Vessel Admin — Standing Tide', email: 'skelley@standingtide.com' },
  { label: 'Kelly Paulson', sub: 'Finance — Standing Tide', email: 'kpaulson@standingtide.com' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('BenderBoat2026!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const quickLogin = (em: string) => {
    setEmail(em)
    setTimeout(async () => {
      setError(''); setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email: em, password: 'BenderBoat2026!' })
      if (error) setError(error.message)
      setLoading(false)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">⚓ Sentinel Core</h1>
          <p className="text-gray-400 mt-2">Vessel Operations & Crew Management</p>
          <p className="text-gray-600 text-xs mt-1">by Ops Normal AI LLC</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 rounded-lg transition">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-xs mb-3 text-center">Quick Access</p>
            <div className="space-y-2">
              {DEMO_USERS.map(u => (
                <button key={u.email} onClick={() => quickLogin(u.email)}
                  className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-2 transition">
                  <span className="text-white text-sm font-medium">{u.label}</span>
                  <span className="text-gray-500 text-xs ml-2">{u.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
