import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Anchor, MapPin, Users, Ruler, Hash, Ship } from 'lucide-react'

interface Vessel {
  id: string
  name: string
  vessel_type: string
  vessel_class: string
  flag_state: string
  home_port: string
  imo_number: string
  call_sign: string
  gross_tons: number
  length_overall: number
  crewCount: number
  positionCount: number
}

export default function Vessels() {
  const { profile } = useAuth()
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [selected, setSelected] = useState<Vessel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadVessels() }, [])

  async function loadVessels() {
    const { data } = await supabase.from('vessels').select('id, name, vessel_type, vessel_class, flag_state, home_port, imo_number, call_sign, gross_tons, length_overall').eq('org_id', profile?.org_id)
    const enriched: Vessel[] = []
    for (const v of (data || [])) {
      const { count: posCount } = await supabase.from('bb_positions').select('*', { count: 'exact', head: true }).eq('vessel_id', v.id)
      enriched.push({ ...v, positionCount: posCount || 0, crewCount: posCount || 0 })
    }
    setVessels(enriched)
    setLoading(false)
  }

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div></div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Fleet Vessels</h1>
        <p className="text-slate-500 text-sm mt-1">{vessels.length} vessels in your fleet</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vessels.map(vessel => (
          <div key={vessel.id} onClick={() => setSelected(vessel)} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-cyan-300 cursor-pointer transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-200 transition-shadow"><Anchor className="w-7 h-7 text-white" /></div>
              <div className="flex-1"><h3 className="text-lg font-bold text-slate-800">{vessel.name}</h3><p className="text-sm text-slate-500">{vessel.vessel_class || vessel.vessel_type || 'Vessel'}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 rounded-lg bg-slate-50"><Users className="w-4 h-4 text-slate-400 mx-auto mb-1" /><p className="text-lg font-bold text-slate-800">{vessel.positionCount}</p><p className="text-xs text-slate-500">Positions</p></div>
              <div className="text-center p-3 rounded-lg bg-slate-50"><MapPin className="w-4 h-4 text-slate-400 mx-auto mb-1" /><p className="text-sm font-medium text-slate-800 truncate">{vessel.home_port || '\u2014'}</p><p className="text-xs text-slate-500">Home Port</p></div>
              <div className="text-center p-3 rounded-lg bg-slate-50"><Ship className="w-4 h-4 text-slate-400 mx-auto mb-1" /><p className="text-sm font-medium text-slate-800">{vessel.flag_state || '\u2014'}</p><p className="text-xs text-slate-500">Flag</p></div>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"><Anchor className="w-8 h-8 text-white" /></div>
              <div><h2 className="text-2xl font-bold text-slate-800">{selected.name}</h2><p className="text-slate-500">{selected.vessel_class || selected.vessel_type}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['IMO Number', selected.imo_number, Hash], ['Call Sign', selected.call_sign, Hash], ['Flag State', selected.flag_state, MapPin], ['Home Port', selected.home_port, MapPin], ['Gross Tons', selected.gross_tons?.toLocaleString(), Ruler], ['Length Overall', selected.length_overall ? selected.length_overall + ' m' : null, Ruler], ['Positions', selected.positionCount, Users]].map(([label, value, Icon]: any) => (
                <div key={label} className="p-3 rounded-lg bg-slate-50"><div className="flex items-center gap-2 mb-1"><Icon className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs text-slate-500">{label}</span></div><p className="font-medium text-slate-800">{value || '\u2014'}</p></div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="mt-6 w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium text-sm transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
