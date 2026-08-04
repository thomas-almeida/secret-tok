import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
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
    associatedUsers: string[],
    transactions?: any[]
  }
}

export interface Customer {
  _id: string
  email: string
  subscription: {
    amount: number
    active: boolean
    transactionDate: string
    planId?: string
    _id: string
  },
  closeFriendsAccess?: {
    active: boolean
    purchasedAt?: string
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

interface CustomerStore {
  customer: Customer | null
  isCustomerAuthenticated: boolean
  isHydrated: boolean
  loginCustomer: (customerData: Customer) => void
  logout: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (userData) => {
        if (!userData?._id) return
        set({ user: userData, isAuthenticated: true })
      },
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

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customer: null,
      isCustomerAuthenticated: false,
      isHydrated: false,
      loginCustomer: (customerData) => {
        if (!customerData?._id) return
        set({ customer: customerData, isCustomerAuthenticated: true })
      },
      logout: () => set({ customer: null, isCustomerAuthenticated: false }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'customer-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
        }
      },
    }
  )
)

