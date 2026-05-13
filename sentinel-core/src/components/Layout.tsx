import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthProvider'
import { useFleet } from '../FleetProvider'
import CommandPalette from './CommandPalette'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/vessels', label: 'Vessels', icon: '🚢' },
  { to: '/crew', label: 'Crew', icon: '👥' },
  { to: '/manning', label: 'Manning', icon: '📐' },
  { to: '/credentials', label: 'Credentials', icon: '📋' },
  { to: '/watch', label: 'Watch', icon: '⏰' },
  { to: '/voyages', label: 'Voyages', icon: '🗺️' },
  { to: '/crew-changes', label: 'Crew Changes', icon: '🔄' },
  { to: '/travel', label: 'Travel', icon: '✈️' },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const { fleets, selectedFleet, setSelectedFleet } = useFleet()

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <CommandPalette />

      {/* Sidebar */}
      <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-white tracking-tight">SENTINEL-CORE</h1>
          <p className="text-[10px] text-slate-500 mt-0.5">Ops Normal AI LLC</p>
        </div>

        {/* Fleet Selector */}
        {fleets.length > 0 && (
          <div className="px-3 py-3 border-b border-slate-700">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Fleet</label>
            <select
              value={selectedFleet?.id || 'all'}
              onChange={e => {
                if (e.target.value === 'all') setSelectedFleet(null)
                else setSelectedFleet(fleets.find(f => f.id === e.target.value) || null)
              }}
              className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Fleets</option>
              {fleets.map(f => (
                <option key={f.id} value={f.id}>
                  {f.short_code} — {f.name}{f.is_managed_client ? ' ⟡' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Command Palette Trigger */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="mx-3 mt-3 mb-1 flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition group"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span className="flex-1 text-left text-xs">Search...</span>
          <kbd className="text-[9px] px-1 py-0.5 bg-slate-600 rounded border border-slate-500 group-hover:border-slate-400">⌘K</kbd>
        </button>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? 'bg-cyan-600/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700/50'
                }`
              }>
              <span>{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <div className="text-sm text-white font-medium">{profile?.display_name}</div>
          <div className="text-xs text-slate-400">{profile?.role}</div>
          <button onClick={signOut} className="mt-2 text-xs text-red-400 hover:text-red-300 transition">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        {selectedFleet && (
          <div className="mb-4 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedFleet.is_managed_client ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
              {selectedFleet.short_code}
            </span>
            <span className="text-sm text-slate-400">Viewing: {selectedFleet.display_name}</span>
            <button onClick={() => setSelectedFleet(null)} className="text-xs text-slate-500 hover:text-slate-300 ml-2">(clear filter)</button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
