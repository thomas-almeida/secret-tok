import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  phone: number
  email: string
  subscription: {
    amount: number
    active: boolean
    transactionDate: string
    _id: string
  },
  revenue: {
    userId: string
    createdAt: string
    updatedAt: string
    balance: number
    associatedUsers: string[]
  }
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)