import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  user_id: number
  username: string
  email: string | null
  mobile: string | null
  status: string
  avatar: string | null
}

interface AuthState {
  token: string | null
  user: User | null
  roles: string[]
  isAuthenticated: boolean
  setAuth: (token: string, user: User, roles: string[]) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      roles: [],
      isAuthenticated: false,

      setAuth: (token, user, roles) =>
        set({
          token,
          user,
          roles,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          roles: [],
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
