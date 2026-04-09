import { createContext, useContext, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './i18n.js'
import Login     from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Assets    from './pages/Assets.jsx'
import Analytics from './pages/Analytics.jsx'
import Datasets  from './pages/Datasets.jsx'
import Reports   from './pages/Reports.jsx'
import Settings  from './pages/Settings.jsx'
import Profile   from './pages/Profile.jsx'
import { RealtimeProvider } from './context/RealtimeContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

// ─── Auth context ─────────────────────────────────────────────────────────────

// ─── Auth context ─────────────────────────────────────────────────────────────
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('zta_token') || null)
  const [user,  setUser]  = useState(() => localStorage.getItem('zta_user')  || null)

  const login  = (t, u) => { setToken(t); setUser(u); localStorage.setItem('zta_token', t); localStorage.setItem('zta_user', u) }
  const logout = ()     => { setToken(null); setUser(null); localStorage.clear() }

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>
}

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RealtimeProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/assets"    element={<PrivateRoute><Assets /></PrivateRoute>} />
                <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                <Route path="/datasets"  element={<PrivateRoute><Datasets /></PrivateRoute>} />
                <Route path="/reports"   element={<PrivateRoute><Reports /></PrivateRoute>} />
                <Route path="/settings"  element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="*"      element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </RealtimeProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
