import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'
import { useAuth } from './AuthProvider'

interface Fleet { id: string; name: string; short_code: string; display_name: string; is_managed_client: boolean }
interface FleetCtx { fleets: Fleet[]; selectedFleet: Fleet | null; setSelectedFleet: (f: Fleet | null) => void; fleetFilter: Record<string, string> | null }
const Ctx = createContext<FleetCtx>({} as FleetCtx)
export const useFleet = () => useContext(Ctx)

export function FleetProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [fleets, setFleets] = useState<Fleet[]>([])
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null)

  useEffect(() => {
    if (!session) return
    supabase.from('fleets').select('*').order('is_managed_client').then(({ data }) => {
      if (data) setFleets(data)
    })
  }, [session])

  // Helper: returns { fleet_id: id } or null (for "All Fleets")
  const fleetFilter = selectedFleet ? { fleet_id: selectedFleet.id } : null

  return <Ctx.Provider value={{ fleets, selectedFleet, setSelectedFleet, fleetFilter }}>{children}</Ctx.Provider>
}
