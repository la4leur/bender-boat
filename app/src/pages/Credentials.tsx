import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Shield } from 'lucide-react'

interface CredType {
  id: string
  name: string
  category: string
  issuing_authority: string
  validity_months: number
}

export default function Credentials() {
  const [creds, setCreds] = useState<CredType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('credential_types').select('*').order('category', { ascending: true }).then(({ data }) => { setCreds(data || []); setLoading(false) })
  }, [])

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div></div>

  const categories = Array.from(new Set(creds.map(c => c.category)))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Credential Types</h1>
        <p className="text-slate-500 text-sm mt-1">{creds.length} credential types tracked</p>
      </div>
      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-500" />{cat}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {creds.filter(c => c.category === cat).map(cred => (
                <div key={cred.id} className="px-6 py-3 flex items-center justify-between hover:bg-cyan-50/30 transition-colors">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{cred.name}</p>
                    <p className="text-xs text-slate-400">{cred.issuing_authority}</p>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{cred.validity_months ? cred.validity_months + ' months' : 'No expiry'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
