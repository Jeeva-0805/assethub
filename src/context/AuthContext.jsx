import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, getMe } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('assethub_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verifyUser() {
      const storedToken = localStorage.getItem('assethub_token')
      if (storedToken) {
        try {
          const userData = await getMe()
          setUser(userData)
        } catch (err) {
          console.error("Token verification failed:", err.message)
          localStorage.removeItem('assethub_token')
          localStorage.removeItem('assethub_user')
          setUser(null)
          setToken(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    verifyUser()
  }, [])

  const loginUser = async (email, password) => {
    const data = await apiLogin({ email, password })
    localStorage.setItem('assethub_token', data.token)
    localStorage.setItem('assethub_user', JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role
    }))
    setToken(data.token)
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role
    })
    return data
  }

  const logoutUser = () => {
    localStorage.removeItem('assethub_token')
    localStorage.removeItem('assethub_user')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    loginUser,
    logoutUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
