import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { STRAPI_BASE_URL } from '../config'

const AuthContext = createContext()
const API_URL = STRAPI_BASE_URL

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const response = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          })
          setUser(response.data)
          setToken(storedToken)
        } catch (error) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    verifyToken()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/local`, {
        identifier: email,
        password: password,
      })
      const { jwt, user } = response.data
      localStorage.setItem('token', jwt)
      
      setToken(jwt)
      setUser(user)
      return { success: true }
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu, vui lòng thử lại sau vài phút')
      }
      throw error
    }
  }

  const logout = async () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  )
}