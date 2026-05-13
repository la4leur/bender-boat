import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'

interface CrewMember {
  id: string
  first_name: string
  last_name: string
  rank: string
  nationality: string
  status: string
  email: string
  phone: string
  contract_start: string
  contract_end: string
}

type SortField = 'last_name' | 'rank' | 'nationality' | 'status' | 'contract_end'
type SortDir = 'asc' | 'desc'

export default function CrewRoster() {
  const [crew, setCrew] = useState<CrewMember[]>([])
  const [filtered, setFiltered] = useState<CrewMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('last_name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<CrewMember | null>(null)
  const perPage = 25

  useEffect(() => { loadCrew() }, [])
  useEffect(() => {
    let result = [...crew]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(c => c.first_name?.toLowerCase().includes(s) || c.last_name?.toLowerCase().includes(s) || c.rank?.toLowerCase().includes(s) || c.nationality?.toLowerCase().includes(s))
    }
    if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter)
    result.sort((a, b) => {
      const aVal = (a[sortField] || '').toLowerCase()
      const bVal = (b[sortField] || '').toLowerCase()
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
    setFiltered(result)
    setPage(0)
  }, [crew, search, statusFilter, sortField, sortDir])

  async function loadCrew() {
    const { data, error } = await supabase.from('crew_members').select('id, first_name, last_name, rank, nationality, status, email, phone, contract_start, contract_end').order('last_name', { ascending: true })
    if (error) console.error(error)
    setCrew(data || [])
    setLoading(false)
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-300" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-cyan-500" /> : <ChevronDown className="w-3 h-3 text-cyan-500" />
  }

  const pageData = filtered.slice(page * perPage, (page + 1) * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)
  const statuses = ['all', ...Array.from(new Set(crew.map(c => c.status).filter(Boolean)))]

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div></div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Crew Roster</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} of {crew.length} crew members</p>
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, rank, or nationality..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
            {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {([['last_name', 'Name'], ['rank', 'Rank / Position'], ['nationality', 'Nationality'], ['status', 'Status'], ['contract_end', 'Contract End']] as [SortField, string][]).map(([field, label]) => (
                  <th key={field} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700" onClick={() => toggleSort(field)}>
                    <span className="flex items-center gap-1">{label} <SortIcon field={field} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageData.map(member => (
                <tr key={member.id} className="hover:bg-cyan-50/50 cursor-pointer transition-colors" onClick={() => setSelected(member)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">{(member.first_name?.[0] || '')}{(member.last_name?.[0] || '')}</div>
                      <div><p className="font-medium text-slate-800">{member.last_name}, {member.first_name}</p><p className="text-xs text-slate-400">{member.email || ''}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{member.rank || '\u2014'}</td>
                  <td className="px-4 py-3 text-slate-600">{member.nationality || '\u2014'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : member.status === 'on_leave' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{member.status || 'unknown'}</span></td>
                  <td className="px-4 py-3 text-slate-600">{member.contract_end ? new Date(member.contract_end).toLocaleDateString() : '\u2014'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">Showing {page * perPage + 1}\u2013{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50">Previous</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-96 bg-white h-full shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Crew Detail</h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">{(selected.first_name?.[0] || '')}{(selected.last_name?.[0] || '')}</div>
              <div><h3 className="text-xl font-bold text-slate-800">{selected.first_name} {selected.last_name}</h3><p className="text-slate-500">{selected.rank}</p></div>
            </div>
            <div className="space-y-4">
              {[['Status', selected.status], ['Nationality', selected.nationality], ['Email', selected.email], ['Phone', selected.phone], ['Contract Start', selected.contract_start ? new Date(selected.contract_start).toLocaleDateString() : '\u2014'], ['Contract End', selected.contract_end ? new Date(selected.contract_end).toLocaleDateString() : '\u2014']].map(([label, value]) => (
                <div key={label as string} className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-500">{label}</span><span className="text-sm font-medium text-slate-800">{value || '\u2014'}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
