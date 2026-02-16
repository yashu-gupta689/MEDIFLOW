import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [loading, setLoading] = useState(false)
  const [logoutTimer, setLogoutTimer] = useState(null)

  const scheduleAutoLogout = (jwt) => {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]))
      if (payload && payload.exp) {
        const ms = payload.exp * 1000 - Date.now()
        if (ms > 0) {
          if (logoutTimer) clearTimeout(logoutTimer)
          const t = setTimeout(() => {
            logout()
          }, ms)
          setLogoutTimer(t)
        } else {
          logout()
        }
      }
    } catch {
    }
  }

  const login = async ({ email, password }) => {
    try {
      setLoading(true)
      const { data } = await api.post('/auth/login', { email, password })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      scheduleAutoLogout(data.token)
    } catch (e) {
      console.error(e)
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    try {
      setLoading(true)
      const { data } = await api.post('/auth/register', payload)
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('token', data.token)
      scheduleAutoLogout(data.token)
    } catch (e) {
      console.error(e)
      alert('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem('token')
    if (logoutTimer) clearTimeout(logoutTimer)
    setLogoutTimer(null)
  }

  useEffect(() => {
    if (token) {
      scheduleAutoLogout(token)
    }
  }, [])

  return (
    <AuthCtx.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
