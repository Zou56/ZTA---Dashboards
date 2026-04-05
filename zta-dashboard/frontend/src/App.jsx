import { createContext, useContext, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login     from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="*"      element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
