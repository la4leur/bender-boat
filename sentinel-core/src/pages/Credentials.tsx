import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CredentialType {
  id: string;
  name: string;
  category: string;
  issuing_authority: string | null;
  renewal_period_months: number | null;
  is_mandatory: boolean;
}

export default function Credentials() {
  const { profile } = useAuth();
  const [types, setTypes] = useState<CredentialType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase.from('credential_types').select('*').eq('org_id', profile.org_id).order('name')
      .then(({ data }) => { setTypes((data as CredentialType[]) || []); setLoading(false); });
  }, [profile]);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-slate-400">Loading...</div></div>;

  const byCategory: Record<string, CredentialType[]> = {};
  types.forEach(t => {
    const cat = t.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Credential Types</h1>
      <p className="text-slate-400 mb-6">{types.length} credential types configured from LEX compliance matrix</p>
      <div className="space-y-6">
        {Object.keys(byCategory).map(cat => (
          <div key={cat} className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">{cat} <span className="text-slate-400 text-sm font-normal">({byCategory[cat].length})</span></h2>
            </div>
            <div className="divide-y divide-slate-700">
              {byCategory[cat].map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-700/50">
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.issuing_authority || 'Various'} &bull; Renewal: {t.renewal_period_months ? `${t.renewal_period_months} months` : 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${t.is_mandatory ? 'bg-red-500/20 text-red-300' : 'bg-slate-600/50 text-slate-300'}`}>
                    {t.is_mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
