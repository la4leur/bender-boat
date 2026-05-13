import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CrewRoster from './pages/CrewRoster'
import Vessels from './pages/Vessels'
import Credentials from './pages/Credentials'
import Schedule from './pages/Schedule'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/crew" element={<CrewRoster />} />
          <Route path="/vessels" element={<Vessels />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/schedule" element={<Schedule />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
