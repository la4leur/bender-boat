import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useFleet } from '../FleetProvider'

export default function Crew() {
  const { selectedFleet } = useFleet()
  const [searchParams, setSearchParams] = useSearchParams()
  const [crew, setCrew] = useState<any[]>([])
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [departments, setDepartments] = useState<string[]>([])
  const [total, setTotal] = useState(0)

  // Sync URL params
  useEffect(() => {
    const s = searchParams.get('search')
    if (s && s !== search) setSearch(s)
  }, [searchParams])

  useEffect(() => { loadCrew() }, [selectedFleet, search, statusFilter, deptFilter])

  async function loadCrew() {
    let q = supabase.from('crew_members')
      .select('id, first_name, last_name, preferred_name, email, phone, status, department, rotation_name, hire_date, employment_type', { count: 'exact' })
    if (selectedFleet) q = q.eq('fleet_id', selectedFleet.id)
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    if (deptFilter !== 'all') q = q.eq('department', deptFilter)
    if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    const { data, count } = await q.order('last_name').limit(100)
    setCrew(data || []); setTotal(count || 0)

    if (departments.length === 0) {
      let dq = supabase.from('crew_members').select('department')
      if (selectedFleet) dq = dq.eq('fleet_id', selectedFleet.id)
      const { data: depts } = await dq
      const unique = [...new Set((depts || []).map((d: any) => d.department).filter(Boolean))].sort()
      setDepartments(unique as string[])
    }
  }

  function updateSearch(val: string) {
    setSearch(val)
    if (val) setSearchParams({ search: val })
    else setSearchParams({})
  }

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400',
    onboard: 'bg-cyan-500/20 text-cyan-400',
    on_leave: 'bg-amber-500/20 text-amber-400',
    inactive: 'bg-slate-600 text-slate-300',
    terminated: 'bg-red-500/20 text-red-400',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Crew Roster</h1>
          <p className="text-slate-400 text-sm">{total} crew members</p>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => updateSearch(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="onboard">Onboard</option>
          <option value="on_leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="px-4 py-3 text-xs text-slate-400 font-medium">Name</th>
              <th className="px-4 py-3 text-xs text-slate-400 font-medium">Department</th>
              <th className="px-4 py-3 text-xs text-slate-400 font-medium">Rotation</th>
              <th className="px-4 py-3 text-xs text-slate-400 font-medium">Type</th>
              <th className="px-4 py-3 text-xs text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-xs text-slate-400 font-medium">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {crew.map(c => (
              <tr key={c.id} className="hover:bg-slate-700/30 transition">
                <td className="px-4 py-3">
                  <div className="text-white font-medium text-sm">{c.last_name}, {c.first_name}{c.preferred_name ? ` "${c.preferred_name}"` : ''}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">{c.department || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{c.rotation_name || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.employment_type || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[c.status] || 'bg-slate-600 text-slate-300'}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.email || c.phone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {crew.length === 0 && <div className="p-8 text-center text-slate-500">No crew found</div>}
        {total > 100 && <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-700">Showing first 100 of {total}</div>}
      </div>
    </div>
  )
}
