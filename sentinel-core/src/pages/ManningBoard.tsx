import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useFleet } from '../FleetProvider'

interface Billet {
  id: string
  title: string
  department: string
  sort_order: number
  vessel_id: string
  crew_name: string | null
  crew_status: string | null
  assignment_status: string | null
}

interface VesselManning {
  vessel_id: string
  vessel_name: string
  fleet_short: string
  billets: Billet[]
  filled: number
  total: number
}

export default function ManningBoard() {
  const { selectedFleet, fleets } = useFleet()
  const [vessels, setVessels] = useState<VesselManning[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedVessel, setExpandedVessel] = useState<string | null>(null)

  useEffect(() => { loadManning() }, [selectedFleet])

  async function loadManning() {
    setLoading(true)

    // Get vessels
    let vq = supabase.from('vessels').select('id, name, fleet_id')
    if (selectedFleet) vq = vq.eq('fleet_id', selectedFleet.id)
    else vq = vq.not('fleet_id', 'is', null)
    const { data: vesselData } = await vq.order('name')
    if (!vesselData || vesselData.length === 0) { setVessels([]); setLoading(false); return }

    // Get all billets for these vessels
    const vesselIds = vesselData.map(v => v.id)
    const { data: billetData } = await supabase
      .from('vessel_billets')
      .select('id, title, department, sort_order, vessel_id')
      .in('vessel_id', vesselIds)
      .order('sort_order')

    // Get active assignments
    const billetIds = (billetData || []).map(b => b.id)
    let assignments: any[] = []
    if (billetIds.length > 0) {
      const { data: aData } = await supabase
        .from('billet_assignments')
        .select('id, billet_id, crew_member_id, status')
        .in('billet_id', billetIds)
        .eq('status', 'active')
      assignments = aData || []
    }

    // Get crew names for assignments
    const crewIds = assignments.map(a => a.crew_member_id).filter(Boolean)
    let crewMap: Record<string, { name: string; status: string }> = {}
    if (crewIds.length > 0) {
      const { data: crewData } = await supabase
        .from('crew_members')
        .select('id, first_name, last_name, status')
        .in('id', crewIds)
      ;(crewData || []).forEach(c => {
        crewMap[c.id] = { name: `${c.first_name} ${c.last_name}`, status: c.status }
      })
    }

    // Build assignment lookup: billet_id -> assignment
    const assignMap: Record<string, any> = {}
    assignments.forEach(a => { assignMap[a.billet_id] = a })

    // Assemble per-vessel manning
    const result: VesselManning[] = vesselData.map(v => {
      const vBillets = (billetData || []).filter(b => b.vessel_id === v.id)
      const billets: Billet[] = vBillets.map(b => {
        const assign = assignMap[b.id]
        const crew = assign ? crewMap[assign.crew_member_id] : null
        return {
          id: b.id,
          title: b.title,
          department: b.department,
          sort_order: b.sort_order,
          vessel_id: b.vessel_id,
          crew_name: crew?.name || null,
          crew_status: crew?.status || null,
          assignment_status: assign?.status || null,
        }
      })
      const filled = billets.filter(b => b.crew_name).length
      const fleet = fleets.find(f => f.id === v.fleet_id)
      return {
        vessel_id: v.id,
        vessel_name: v.name,
        fleet_short: fleet?.short_code || '',
        billets,
        filled,
        total: billets.length,
      }
    })

    setVessels(result)
    setLoading(false)
    if (result.length > 0 && !expandedVessel) setExpandedVessel(result[0].vessel_id)
  }

  const totalBillets = vessels.reduce((s, v) => s + v.total, 0)
  const totalFilled = vessels.reduce((s, v) => s + v.filled, 0)
  const totalOpen = totalBillets - totalFilled
  const fillRate = totalBillets > 0 ? Math.round((totalFilled / totalBillets) * 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-cyan-400 animate-pulse">Loading manning data...</div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manning Board</h1>
        <p className="text-slate-400 text-sm">Billet assignments across the fleet</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-3xl font-bold text-white">{totalBillets}</div>
          <div className="text-sm text-slate-400">Total Billets</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-3xl font-bold text-emerald-400">{totalFilled}</div>
          <div className="text-sm text-slate-400">Filled</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-3xl font-bold text-red-400">{totalOpen}</div>
          <div className="text-sm text-slate-400">Open Billets</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-3xl font-bold text-cyan-400">{fillRate}%</div>
          <div className="text-sm text-slate-400">Fill Rate</div>
        </div>
      </div>

      {/* Vessel Cards */}
      <div className="space-y-4">
        {vessels.map(v => {
          const isExpanded = expandedVessel === v.vessel_id
          const openCount = v.total - v.filled
          const pct = v.total > 0 ? Math.round((v.filled / v.total) * 100) : 0
          const deptGroups: Record<string, Billet[]> = {}
          v.billets.forEach(b => {
            const d = b.department || 'General'
            if (!deptGroups[d]) deptGroups[d] = []
            deptGroups[d].push(b)
          })

          return (
            <div key={v.vessel_id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedVessel(isExpanded ? null : v.vessel_id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-750 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚢</span>
                  <div className="text-left">
                    <div className="text-white font-semibold">{v.vessel_name}</div>
                    <div className="text-xs text-slate-400">{v.fleet_short}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 75 ? 'bg-cyan-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-300 w-20 text-right">
                      {v.filled}/{v.total}
                    </span>
                  </div>
                  {openCount > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-medium">
                      {openCount} open
                    </span>
                  )}
                  {openCount === 0 && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-medium">
                      Full
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-700 px-5 py-4">
                  {Object.entries(deptGroups).map(([dept, billets]) => (
                    <div key={dept} className="mb-4 last:mb-0">
                      <div className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">{dept}</div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {billets.map(b => (
                          <div
                            key={b.id}
                            className={`px-3 py-2.5 rounded-lg border transition ${
                              b.crew_name
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                            }`}
                          >
                            <div className={`text-xs font-medium ${b.crew_name ? 'text-emerald-400' : 'text-red-400'}`}>
                              {b.title}
                            </div>
                            {b.crew_name ? (
                              <div className="text-sm text-white mt-0.5">{b.crew_name}</div>
                            ) : (
                              <div className="text-sm text-red-300/60 mt-0.5 italic">Unfilled</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {vessels.length === 0 && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
            <span className="text-4xl block mb-3">📐</span>
            <p className="text-slate-400">No vessels with billets in this fleet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
