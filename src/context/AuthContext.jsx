import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session?.user?.id])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading: session === undefined,
    signUp: async (email, password, fullName) => {
      return supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
    },
    signIn: async (email, password) => {
      return supabase.auth.signInWithPassword({ email, password })
    },
    signInWithMagicLink: async (email) => {
      return supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
    },
    signOut: async () => supabase.auth.signOut(),
    refreshProfile: async () => {
      if (!session?.user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(data)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
