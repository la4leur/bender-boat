import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useFleet } from '../FleetProvider'

interface Vessel {
  id: string; name: string; vessel_type: string; imo_number: string; call_sign: string;
  flag_state: string; gross_tons: number; vessel_class: string; fleet_id: string;
}

export default function Vessels() {
  const { selectedFleet, fleets } = useFleet()
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [selected, setSelected] = useState<Vessel | null>(null)
  const [positions, setPositions] = useState<any[]>([])

  useEffect(() => { loadVessels() }, [selectedFleet])

  async function loadVessels() {
    let q = supabase.from('vessels').select('*')
    if (selectedFleet) q = q.eq('fleet_id', selectedFleet.id)
    else q = q.not('fleet_id', 'is', null)
    const { data } = await q.order('name')
    setVessels(data || [])
    setSelected(null); setPositions([])
  }

  async function selectVessel(v: Vessel) {
    setSelected(v)
    const { data } = await supabase.from('bb_positions').select('*').eq('vessel_id', v.id).order('sort_order')
    setPositions(data || [])
  }

  const fleetName = (fid: string) => fleets.find(f => f.id === fid)?.short_code || ''

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Vessels</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-3">
          {vessels.map(v => (
            <button key={v.id} onClick={() => selectVessel(v)}
              className={`w-full text-left p-4 rounded-xl border transition ${
                selected?.id === v.id ? 'bg-cyan-600/20 border-cyan-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">{v.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{fleetName(v.fleet_id)}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {v.vessel_class || v.vessel_type || 'Expedition Vessel'} {v.flag_state ? `• ${v.flag_state}` : ''}
              </div>
            </button>
          ))}
          {vessels.length === 0 && <p className="text-slate-500 text-sm">No vessels in this fleet.</p>}
        </div>

        <div className="col-span-2">
          {selected ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700">
              <div className="p-5 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                <div className="flex gap-4 mt-2 text-sm text-slate-400">
                  {selected.imo_number && <span>IMO: {selected.imo_number}</span>}
                  {selected.call_sign && <span>Call Sign: {selected.call_sign}</span>}
                  {selected.gross_tons && <span>GT: {selected.gross_tons.toLocaleString()}</span>}
                  {selected.flag_state && <span>Flag: {selected.flag_state}</span>}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Positions ({positions.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {positions.map(p => (
                    <div key={p.id} className="px-3 py-2 bg-slate-700/50 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-white">{p.title}</span>
                      <span className="text-xs text-slate-400">{p.department}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
              <span className="text-4xl">🚢</span>
              <p className="text-slate-400 mt-3">Select a vessel to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
