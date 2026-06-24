import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

const MOCK_USER = {
  id: '1',
  email: 'demo@devbrain.ai',
  name: 'Demo User',
  role: 'Engineer',
  avatar: null,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        if (useMock) {
          const saved = localStorage.getItem('devbrain_user')
          setUser(saved ? JSON.parse(saved) : MOCK_USER)
        } else {
          const profile = await authApi.getProfile()
          setUser(profile)
        }
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [useMock])

  const login = useCallback(async (credentials) => {
    if (useMock) {
      await new Promise((r) => setTimeout(r, 800))
      const mockUser = { ...MOCK_USER, email: credentials.email }
      localStorage.setItem('access_token', 'mock-access-token')
      localStorage.setItem('refresh_token', 'mock-refresh-token')
      if (credentials.remember) {
        localStorage.setItem('devbrain_user', JSON.stringify(mockUser))
      }
      setUser(mockUser)
      return mockUser
    }
    const data = await authApi.login(credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const profile = await authApi.getProfile()
    setUser(profile)
    return profile
  }, [useMock])

  const register = useCallback(async (userData) => {
    if (useMock) {
      await new Promise((r) => setTimeout(r, 800))
      const mockUser = { ...MOCK_USER, email: userData.email, name: userData.name }
      localStorage.setItem('access_token', 'mock-access-token')
      localStorage.setItem('refresh_token', 'mock-refresh-token')
      localStorage.setItem('devbrain_user', JSON.stringify(mockUser))
      setUser(mockUser)
      return mockUser
    }
    const data = await authApi.register(userData)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }, [useMock])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('devbrain_user')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data) => {
    if (useMock) {
      const updated = { ...user, ...data }
      setUser(updated)
      localStorage.setItem('devbrain_user', JSON.stringify(updated))
      return updated
    }
    const profile = await authApi.updateProfile(data)
    setUser(profile)
    return profile
  }, [useMock, user])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
