import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id: string
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
    _id: string
    createdAt: string
    updatedAt: string
    balance: number
    associatedUsers: string[]
  }
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (userData: User) => void
  logout: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
        }
      },
    }
  )
)