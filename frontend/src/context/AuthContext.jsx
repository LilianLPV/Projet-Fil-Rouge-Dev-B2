import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'ymmo_user'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setCurrentUser(user)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUser(null)
  }

  // Le backend renvoie role.roleName (pas role.name)
  const getRoleName = () => currentUser?.role?.roleName ?? ''
  const isAdmin = () => getRoleName().toLowerCase() === 'admin'
  const isAgent = () => getRoleName().toLowerCase() === 'agent'
  const isClient = () => getRoleName().toLowerCase() === 'client'

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAdmin, isAgent, isClient, getRoleName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
