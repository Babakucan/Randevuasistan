import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  authApi,
  getToken,
  removeToken,
  getCurrentSalonId,
  setCurrentSalonId,
} from '@/lib/api'

interface SalonOption {
  id: string
  name: string
}

interface AdminSession {
  user: any | null
  salons: SalonOption[]
  currentSalonId: string | null
  loading: boolean
  signOut: () => void
  selectSalon: (salonId: string) => void
  refreshUser: () => Promise<void>
}

export function useAdminSession(): AdminSession {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [salons, setSalons] = useState<SalonOption[]>([])
  const [currentSalonIdState, setCurrentSalonIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    try {
      setLoading(true)
      const token = getToken()
      if (!token) {
        router.push('/login')
        return
      }

      const userData = await authApi.getCurrentUser()
      if (!userData) {
        throw new Error('Kullanıcı bulunamadı')
      }

      setUser(userData)

      const userSalons: SalonOption[] = (userData.salonProfiles || []).map((salon: any) => ({
        id: salon.id,
        name: salon.name,
      }))
      setSalons(userSalons)

      if (userSalons.length > 0) {
        let activeSalonId = getCurrentSalonId()
        if (!activeSalonId || !userSalons.some((salon) => salon.id === activeSalonId)) {
          activeSalonId = userSalons[0].id
          setCurrentSalonId(activeSalonId)
        }
        setCurrentSalonIdState(activeSalonId)
      } else {
        setCurrentSalonIdState(null)
      }
    } catch (error) {
      console.error('Admin session error:', error)
      removeToken()
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const signOut = useCallback(() => {
    removeToken()
    router.push('/login')
  }, [router])

  const selectSalon = useCallback(
    (salonId: string) => {
      if (!salonId || salonId === currentSalonIdState) return
      if (!salons.some((salon) => salon.id === salonId)) return

      setCurrentSalonIdState(salonId)
      setCurrentSalonId(salonId)
    },
    [currentSalonIdState, salons]
  )

  return useMemo(
    () => ({
      user,
      salons,
      currentSalonId: currentSalonIdState,
      loading,
      signOut,
      selectSalon,
      refreshUser: loadUser,
    }),
    [currentSalonIdState, loadUser, loading, salons, signOut, selectSalon, user]
  )
}

export default useAdminSession
