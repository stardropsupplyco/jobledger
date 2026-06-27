import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setJobs(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const createJob = async (job) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert({ ...job, user_id: user.id })
      .select()
      .single()
    if (!error) setJobs((prev) => [data, ...prev])
    return { data, error }
  }

  const updateJob = async (id, patch) => {
    const { data, error } = await supabase
      .from('jobs')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (!error) setJobs((prev) => prev.map((j) => (j.id === id ? data : j)))
    return { data, error }
  }

  const deleteJob = async (id) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (!error) setJobs((prev) => prev.filter((j) => j.id !== id))
    return { error }
  }

  return { jobs, loading, refresh, createJob, updateJob, deleteJob }
}

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('type', { ascending: false })
      .order('name')
    if (!error) setCategories(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const createCategory = async (cat) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...cat, user_id: user.id })
      .select()
      .single()
    if (!error) setCategories((prev) => [...prev, data])
    return { data, error }
  }

  const deleteCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) setCategories((prev) => prev.filter((c) => c.id !== id))
    return { error }
  }

  return { categories, loading, refresh, createCategory, deleteCategory }
}

export function useTransactions(filters = {}) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select('*, jobs(id, name), categories(id, name, color, type)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.jobId) query = query.eq('job_id', filters.jobId)
    if (filters.type) query = query.eq('type', filters.type)

    const { data, error } = await query
    if (!error) setTransactions(data ?? [])
    setLoading(false)
  }, [user, filters.jobId, filters.type])

  useEffect(() => { refresh() }, [refresh])

  const createTransaction = async (tx) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...tx, user_id: user.id })
      .select('*, jobs(id, name), categories(id, name, color, type)')
      .single()
    if (!error) setTransactions((prev) => [data, ...prev])
    return { data, error }
  }

  const updateTransaction = async (id, patch) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(patch)
      .eq('id', id)
      .select('*, jobs(id, name), categories(id, name, color, type)')
      .single()
    if (!error) setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)))
    return { data, error }
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) setTransactions((prev) => prev.filter((t) => t.id !== id))
    return { error }
  }

  return { transactions, loading, refresh, createTransaction, updateTransaction, deleteTransaction }
}
