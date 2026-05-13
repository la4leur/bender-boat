import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, Users, Ship, LogOut, Anchor, Shield, Calendar } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/crew', icon: Users, label: 'Crew Roster' },
  { to: '/vessels', icon: Ship, label: 'Vessels' },
  { to: '/credentials', icon: Shield, label: 'Credentials' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
]

export default function Layout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-gradient-to-b from-[#0d1423] to-[#1a2846] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Sentinel-Core</h1>
              <p className="text-xs text-cyan-300/70">Ops Normal AI</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{profile?.display_name || 'User'}</p>
              <p className="text-xs text-slate-400 capitalize">{profile?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
