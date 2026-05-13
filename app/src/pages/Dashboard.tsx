import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, Ship, Calendar, ArrowRight, Anchor, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Stats {
  crewCount: number
  vesselCount: number
  upcomingChanges: number
  credentialAlerts: number
}

interface VesselSummary {
  id: string
  name: string
  vessel_type: string
  vessel_class: string
  crewCount: number
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats>({ crewCount: 0, vesselCount: 0, upcomingChanges: 0, credentialAlerts: 0 })
  const [vessels, setVessels] = useState<VesselSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const { count: crewCount } = await supabase.from('crew_members').select('*', { count: 'exact', head: true }).eq('status', 'active')
      const { data: vesselData } = await supabase.from('vessels').select('id, name, vessel_type, vessel_class').eq('org_id', profile?.org_id)
      const vesselsWithCrew: VesselSummary[] = []
      for (const v of (vesselData || [])) {
        const { count } = await supabase.from('bb_positions').select('*', { count: 'exact', head: true }).eq('vessel_id', v.id)
        vesselsWithCrew.push({ ...v, crewCount: count || 0 })
      }
      const thirtyDays = new Date()
      thirtyDays.setDate(thirtyDays.getDate() + 30)
      const { count: upcomingChanges } = await supabase.from('crew_members').select('*', { count: 'exact', head: true }).lte('contract_end', thirtyDays.toISOString()).gte('contract_end', new Date().toISOString())
      const { count: credentialAlerts } = await supabase.from('credential_types').select('*', { count: 'exact', head: true })
      setStats({ crewCount: crewCount || 0, vesselCount: vesselData?.length || 0, upcomingChanges: upcomingChanges || 0, credentialAlerts: credentialAlerts || 0 })
      setVessels(vesselsWithCrew)
    } catch (err) { console.error('Dashboard load error:', err) }
    setLoading(false)
  }

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div></div>

  const statCards = [
    { label: 'Active Crew', value: stats.crewCount, icon: Users, color: 'bg-cyan-500', link: '/crew' },
    { label: 'Vessels', value: stats.vesselCount, icon: Ship, color: 'bg-blue-500', link: '/vessels' },
    { label: 'Upcoming Changes', value: stats.upcomingChanges, icon: Calendar, color: 'bg-amber-500', link: '/crew' },
    { label: 'Credential Types', value: stats.credentialAlerts, icon: Shield, color: 'bg-emerald-500', link: '/credentials' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {profile?.display_name || 'Captain'}</h1>
        <p className="text-slate-500 mt-1">Here\u2019s your fleet overview for today</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="group">
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-cyan-500 transition-colors" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Fleet Overview</h2>
          <Link to="/vessels" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vessels.map(vessel => (
            <div key={vessel.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow"><Anchor className="w-6 h-6 text-white" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{vessel.name}</h3>
                <p className="text-sm text-slate-500">{vessel.vessel_class || vessel.vessel_type || 'Vessel'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-800">{vessel.crewCount}</p>
                <p className="text-xs text-slate-500">positions</p>
              </div>
            </div>
          ))}
          {vessels.length === 0 && <div className="col-span-2 text-center py-8 text-slate-400"><Ship className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No vessels found for your organization</p></div>}
        </div>
      </div>
    </div>
  )
}
