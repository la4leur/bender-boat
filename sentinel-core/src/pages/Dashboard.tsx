import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useFleet } from '../FleetProvider'
import { useAuth } from '../AuthProvider'

export default function Dashboard() {
  const { profile } = useAuth()
  const { selectedFleet, fleets } = useFleet()
  const [stats, setStats] = useState({ vessels: 0, crew: 0, positions: 0, credentials: 0 })
  const [recentCrew, setRecentCrew] = useState<any[]>([])

  useEffect(() => {
    loadStats()
  }, [selectedFleet])

  async function loadStats() {
    // Vessels
    let vq = supabase.from('vessels').select('id', { count: 'exact', head: true })
    if (selectedFleet) vq = vq.eq('fleet_id', selectedFleet.id)
    else vq = vq.not('fleet_id', 'is', null) // only Bender Boat vessels (have fleet_id)
    const { count: vc } = await vq

    // Crew
    let cq = supabase.from('crew_members').select('id', { count: 'exact', head: true })
    if (selectedFleet) cq = cq.eq('fleet_id', selectedFleet.id)
    const { count: cc } = await cq

    // Positions
    let pq = supabase.from('bb_positions').select('id', { count: 'exact', head: true })
    if (selectedFleet) pq = pq.eq('fleet_id', selectedFleet.id)
    const { count: pc } = await pq

    // Credential types (global — not fleet-specific)
    const { count: crc } = await supabase.from('credential_types').select('id', { count: 'exact', head: true })

    setStats({ vessels: vc || 0, crew: cc || 0, positions: pc || 0, credentials: crc || 0 })

    // Recent crew
    let rcq = supabase.from('crew_members').select('id, first_name, last_name, status, department, hire_date').order('created_at', { ascending: false }).limit(8)
    if (selectedFleet) rcq = rcq.eq('fleet_id', selectedFleet.id)
    const { data: rc } = await rcq
    setRecentCrew(rc || [])
  }

  const cards = [
    { label: 'Vessels', value: stats.vessels, icon: '🚢', color: 'cyan' },
    { label: 'Crew Members', value: stats.crew, icon: '👥', color: 'emerald' },
    { label: 'Positions', value: stats.positions, icon: '📋', color: 'amber' },
    { label: 'Credential Types', value: stats.credentials, icon: '🔐', color: 'purple' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back, {profile?.display_name}</p>
        </div>
        {fleets.length > 1 && !selectedFleet && (
          <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Showing all fleets
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded bg-${c.color}-500/10 text-${c.color}-400`}>
                {selectedFleet?.short_code || 'ALL'}
              </span>
            </div>
            <div className="text-3xl font-bold text-white">{c.value}</div>
            <div className="text-sm text-slate-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Recent Crew</h2>
        </div>
        <div className="divide-y divide-slate-700">
          {recentCrew.map(c => (
            <div key={c.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-white font-medium">{c.first_name} {c.last_name}</span>
                <span className="text-slate-400 text-sm ml-3">{c.department || '—'}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${
                c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                c.status === 'onboard' ? 'bg-cyan-500/20 text-cyan-400' :
                c.status === 'on_leave' ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-600 text-slate-300'
              }`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
