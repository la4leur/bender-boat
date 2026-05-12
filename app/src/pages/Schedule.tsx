import { Calendar } from 'lucide-react'

export default function Schedule() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Crew Schedule</h1>
        <p className="text-slate-500 text-sm mt-1">Rotation and assignment management</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Coming Soon</h2>
        <p className="text-slate-500 max-w-md mx-auto">Crew rotation scheduling, watch assignments, and crew change planning will be available here. This module connects to the Crew Roster and Vessel data to manage embark/disembark cycles.</p>
      </div>
    </div>
  )
}
