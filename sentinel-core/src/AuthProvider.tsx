import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

interface Profile { id: string; display_name: string; email: string; role: string; org_id: string; fleet_id: string | null }
interface AuthCtx { user: User | null; session: Session | null; profile: Profile | null; loading: boolean; signIn: (e: string, p: string) => Promise<any>; signOut: () => void }
const Ctx = createContext<AuthCtx>({} as AuthCtx)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s); setUser(s?.user ?? null)
      if (s?.user) loadProfile(s.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null)
      if (s?.user) loadProfile(s.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(uid: string) {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', uid).single()
    setProfile(data); setLoading(false)
  }

  const signIn = (e: string, p: string) => supabase.auth.signInWithPassword({ email: e, password: p })
  const signOut = () => { supabase.auth.signOut(); setProfile(null) }

  return <Ctx.Provider value={{ user, session, profile, loading, signIn, signOut }}>{children}</Ctx.Provider>
}
