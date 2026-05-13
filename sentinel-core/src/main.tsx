import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'
import { FleetProvider } from './FleetProvider'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FleetProvider>
          <App />
        </FleetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
