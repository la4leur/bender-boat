import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useFleet } from '../FleetProvider'
import { useAuth } from '../AuthProvider'

interface SearchItem {
  id: string
  label: string
  sublabel?: string
  category: 'navigation' | 'vessel' | 'crew' | 'credential' | 'action'
  icon: string
  path?: string
  searchParams?: string
}

const CATEGORY_ORDER = ['navigation', 'vessel', 'crew', 'credential', 'action'] as const
const CATEGORY_LABELS: Record<string, string> = {
  navigation: 'Pages',
  vessel: 'Vessels',
  crew: 'Crew Members',
  credential: 'Credentials',
  action: 'Actions',
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [allItems, setAllItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { selectedFleet, fleets, setSelectedFleet } = useFleet()
  const { signOut } = useAuth()

  const navItems: SearchItem[] = [
    { id: 'nav-dash', label: 'Dashboard', sublabel: 'Overview & fleet stats', category: 'navigation', icon: '📊', path: '/' },
    { id: 'nav-vessels', label: 'Vessels', sublabel: 'Fleet roster & positions', category: 'navigation', icon: '🚢', path: '/vessels' },
    { id: 'nav-crew', label: 'Crew Roster', sublabel: 'All crew members', category: 'navigation', icon: '👥', path: '/crew' },
    { id: 'nav-manning', label: 'Manning Board', sublabel: 'Billet assignments & gaps', category: 'navigation', icon: '📐', path: '/manning' },
    { id: 'nav-creds', label: 'Credentials', sublabel: 'Credential types & requirements', category: 'navigation', icon: '📋', path: '/credentials' },
    { id: 'nav-watch', label: 'Watch Schedule', sublabel: 'Watch assignments', category: 'navigation', icon: '⏰', path: '/watch' },
    { id: 'nav-voyages', label: 'Voyages', sublabel: 'Voyage planning & tracking', category: 'navigation', icon: '🗺️', path: '/voyages' },
    { id: 'nav-cc', label: 'Crew Changes', sublabel: 'Rotation management', category: 'navigation', icon: '🔄', path: '/crew-changes' },
    { id: 'nav-travel', label: 'Travel', sublabel: 'Travel management', category: 'navigation', icon: '✈️', path: '/travel' },
  ]

  const actionItems: SearchItem[] = [
    { id: 'act-signout', label: 'Sign Out', sublabel: 'Log out of Sentinel-Core', category: 'action', icon: '🚪' },
    { id: 'act-all', label: 'Show All Fleets', sublabel: 'Remove fleet filter', category: 'action', icon: '🌐' },
    ...fleets.map(f => ({
      id: `act-fleet-${f.id}`,
      label: `Switch to ${f.display_name}`,
      sublabel: f.is_managed_client ? 'Managed client fleet' : 'Direct fleet',
      category: 'action' as const,
      icon: f.is_managed_client ? '⟡' : '⚓',
    }))
  ]

  // Load dynamic items when palette opens
  useEffect(() => {
    if (!isOpen) return
    loadDynamic()
  }, [isOpen, selectedFleet])

  async function loadDynamic() {
    setLoading(true)
    try {
      // Load vessels
      let vq = supabase.from('vessels').select('id, name, vessel_class, vessel_type, fleet_id')
      if (selectedFleet) vq = vq.eq('fleet_id', selectedFleet.id)
      else vq = vq.not('fleet_id', 'is', null)
      const { data: vessels } = await vq.order('name')

      const vesselItems: SearchItem[] = (vessels || []).map(v => ({
        id: `v-${v.id}`,
        label: v.name,
        sublabel: v.vessel_class || v.vessel_type || 'Vessel',
        category: 'vessel' as const,
        icon: '🚢',
        path: '/vessels',
        searchParams: `?select=${v.id}`,
      }))

      // Load crew
      let cq = supabase.from('crew_members').select('id, first_name, last_name, department, status')
      if (selectedFleet) cq = cq.eq('fleet_id', selectedFleet.id)
      const { data: crew } = await cq.order('last_name').limit(500)

      const crewItems: SearchItem[] = (crew || []).map(c => ({
        id: `c-${c.id}`,
        label: `${c.first_name} ${c.last_name}`,
        sublabel: `${c.department || 'Unassigned'} · ${c.status}`,
        category: 'crew' as const,
        icon: '👤',
        path: '/crew',
        searchParams: `?search=${encodeURIComponent(c.last_name)}`,
      }))

      // Load credential types
      const { data: creds } = await supabase.from('credential_types').select('id, name, document_category').order('name')
      const credItems: SearchItem[] = (creds || []).map(c => ({
        id: `cr-${c.id}`,
        label: c.name,
        sublabel: c.document_category || 'Credential',
        category: 'credential' as const,
        icon: '📜',
        path: '/credentials',
      }))

      setAllItems([...navItems, ...vesselItems, ...crewItems, ...credItems, ...actionItems])
    } catch (e) {
      setAllItems([...navItems, ...actionItems])
    }
    setLoading(false)
  }

  // Fuzzy search
  useEffect(() => {
    if (!query.trim()) {
      setResults(navItems.concat(actionItems).slice(0, 12))
      setSelectedIndex(0)
      return
    }
    const q = query.toLowerCase()
    const scored = allItems.map(item => {
      const label = item.label.toLowerCase()
      const sub = (item.sublabel || '').toLowerCase()
      let score = 0
      if (label === q) score = 100
      else if (label.startsWith(q)) score = 80
      else if (label.includes(q)) score = 60
      else if (sub.includes(q)) score = 40
      else {
        // Word-start matching (e.g. "mc" matches "Manning Board")
        const words = label.split(/\s+/)
        const qWords = q.split(/\s+/)
        if (qWords.every(qw => words.some(w => w.startsWith(qw)))) score = 50
        else {
          // Fuzzy: all query chars present in order
          let qi = 0
          for (let i = 0; i < label.length && qi < q.length; i++) {
            if (label[i] === q[qi]) qi++
          }
          if (qi === q.length) score = 20
        }
      }
      return { item, score }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
    .slice(0, 20)
    .map(s => s.item)

    setResults(scored)
    setSelectedIndex(0)
  }, [query, allItems])

  // Global keyboard listener
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === '/' && !isOpen && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLSelectElement)) {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector('[data-selected="true"]')
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  function handlePaletteKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      executeItem(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function executeItem(item: SearchItem) {
    setIsOpen(false)
    if (item.id === 'act-signout') { signOut(); return }
    if (item.id === 'act-all') { setSelectedFleet(null); navigate('/'); return }
    if (item.id.startsWith('act-fleet-')) {
      const fid = item.id.replace('act-fleet-', '')
      const fleet = fleets.find(f => f.id === fid)
      if (fleet) setSelectedFleet(fleet)
      navigate('/')
      return
    }
    if (item.path) {
      navigate(item.path + (item.searchParams || ''))
    }
  }

  if (!isOpen) return null

  // Build flat list with category headers for rendering
  const rendered: { type: 'header' | 'item'; label?: string; item?: SearchItem; flatIdx?: number }[] = []
  let flatIdx = 0
  const seen = new Set<string>()
  for (const cat of CATEGORY_ORDER) {
    const items = results.filter(r => r.category === cat)
    if (items.length === 0) continue
    if (!seen.has(cat)) {
      rendered.push({ type: 'header', label: CATEGORY_LABELS[cat] })
      seen.add(cat)
    }
    for (const item of items) {
      rendered.push({ type: 'item', item, flatIdx })
      flatIdx++
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]" onClick={() => setIsOpen(false)}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-slate-800 rounded-xl border border-slate-600 shadow-2xl overflow-hidden animate-in"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 border-b border-slate-700">
          <svg className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handlePaletteKey}
            placeholder="Search pages, crew, vessels, credentials..."
            className="flex-1 py-3.5 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <span className="text-cyan-400 text-xs mr-2 animate-pulse">Loading...</span>}
          <kbd className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded border border-slate-600 flex-shrink-0">ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {rendered.map((r, i) => {
            if (r.type === 'header') {
              return (
                <div key={`h-${r.label}`} className="px-4 pt-3 pb-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{r.label}</span>
                </div>
              )
            }
            const item = r.item!
            const idx = r.flatIdx!
            const isSelected = idx === selectedIndex
            return (
              <button
                key={item.id}
                data-selected={isSelected}
                onClick={() => executeItem(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${
                  isSelected ? 'bg-cyan-600/20 text-white' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <span className="text-base w-6 text-center flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.label}</div>
                  {item.sublabel && <div className="text-xs text-slate-500 truncate">{item.sublabel}</div>}
                </div>
                {isSelected && (
                  <kbd className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded flex-shrink-0">↵</kbd>
                )}
              </button>
            )
          })}
          {results.length === 0 && query && (
            <div className="px-4 py-8 text-center">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-slate-500 text-sm">No results for "<span className="text-slate-300">{query}</span>"</p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex gap-4">
            <span><kbd className="px-1 py-0.5 bg-slate-700 rounded border border-slate-600 mr-1">↑</kbd><kbd className="px-1 py-0.5 bg-slate-700 rounded border border-slate-600 mr-1">↓</kbd> navigate</span>
            <span><kbd className="px-1 py-0.5 bg-slate-700 rounded border border-slate-600 mr-1">↵</kbd> open</span>
          </div>
          <span className="text-slate-600">v2.2</span>
        </div>
      </div>
    </div>
  )
}
