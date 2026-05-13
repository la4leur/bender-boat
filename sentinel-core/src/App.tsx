import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Vessels from './pages/Vessels'
import Crew from './pages/Crew'
import Credentials from './pages/Credentials'
import Watch from './pages/Watch'
import Voyages from './pages/Voyages'
import CrewChanges from './pages/CrewChanges'
import Travel from './pages/Travel'

export default function App() {
  const { session, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-cyan-400 text-lg">Loading...</div>
    </div>
  )
  if (!session) return <Login />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vessels" element={<Vessels />} />
        <Route path="/crew" element={<Crew />} />
        <Route path="/credentials" element={<Credentials />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/voyages" element={<Voyages />} />
        <Route path="/crew-changes" element={<CrewChanges />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  )
}
