import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

interface CredType { id: string; name: string; issuing_authority: string; has_expiry: boolean; renewal_lead_days: number; document_category: string; notes: string }

export default function Credentials() {
  const [creds, setCreds] = useState<CredType[]>([])
  const [grouped, setGrouped] = useState<Record<string, CredType[]>>({})

  useEffect(() => {
    supabase.from('credential_types').select('*').order('document_category').order('name').then(({ data }) => {
      const d = data || []
      setCreds(d)
      const g: Record<string, CredType[]> = {}
      d.forEach(c => { const cat = c.document_category || 'Other'; if (!g[cat]) g[cat] = []; g[cat].push(c) })
      setGrouped(g)
    })
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Credential Types</h1>
          <p className="text-slate-400 text-sm">{creds.length} types from LEX compliance matrix</p>
        </div>
      </div>
      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">{cat}</h2>
              <span className="text-xs text-slate-400">{items.length} types</span>
            </div>
            <div className="divide-y divide-slate-700/50">
              {items.map(c => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white font-medium">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.issuing_authority || '—'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.has_expiry && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        Renew: {c.renewal_lead_days}d lead
                      </span>
                    )}
                    {!c.has_expiry && <span className="text-xs text-slate-500">No expiry</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
