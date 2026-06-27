import { useMemo, useState } from 'react'
import { Plus, MapPin, User, ChevronRight, Loader2 } from 'lucide-react'
import { useJobs, useTransactions } from '../lib/hooks'
import { formatMoney } from '../lib/format'
import Modal from '../components/Modal'

const STATUS_STYLE = {
  active: 'bg-sage/15 text-sage border-sage/30',
  completed: 'bg-flag-blue/15 text-flag-blue border-flag-blue/30',
  on_hold: 'bg-copper/15 text-copper border-copper/30',
  cancelled: 'bg-pencil/15 text-pencil border-pencil/30',
}
const STATUS_LABEL = { active: 'Active', completed: 'Completed', on_hold: 'On hold', cancelled: 'Cancelled' }

export default function JobsPage({ onOpenJob }) {
  const { jobs, loading, createJob } = useJobs()
  const { transactions } = useTransactions()
  const [showForm, setShowForm] = useState(false)

  const jobsWithTotals = useMemo(() => {
    return jobs.map((job) => {
      const tx = transactions.filter((t) => t.job_id === job.id)
      const income = tx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const expense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      return { ...job, income, expense, profit: income - expense }
    })
  }, [jobs, transactions])

  return (
    <div className="h-screen overflow-y-auto">
      <header className="h-16 border-b border-rule flex items-center justify-between px-8 sticky top-0 bg-ink/95 backdrop-blur z-10">
        <div>
          <h1 className="font-display font-bold text-lg text-chalk leading-none">Jobs</h1>
          <p className="text-xs text-pencil mt-0.5">Every project, what it's worth, what's left.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-copper hover:bg-copper-dim text-ink font-semibold text-sm px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          New job
        </button>
      </header>

      <div className="p-8 max-w-6xl">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-pencil" /></div>
        ) : jobsWithTotals.length === 0 ? (
          <EmptyState onCreate={() => setShowForm(true)} />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {jobsWithTotals.map((job) => (
              <button
                key={job.id}
                onClick={() => onOpenJob(job.id)}
                className="text-left bg-surface border border-rule rounded-lg p-5 hover:border-rule-strong transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-base text-chalk truncate">{job.name}</h3>
                    {job.client_name && (
                      <p className="text-xs text-pencil flex items-center gap-1 mt-1">
                        <User size={11} /> {job.client_name}
                      </p>
                    )}
                    {job.address && (
                      <p className="text-xs text-pencil-dim flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={11} className="shrink-0" /> {job.address}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded border ${STATUS_STYLE[job.status]}`}>
                    {STATUS_LABEL[job.status]}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-rule">
                  <div>
                    <p className="text-[10px] text-pencil-dim uppercase tracking-wide mb-0.5">In</p>
                    <p className="tabular text-sm font-semibold text-sage">{formatMoney(job.income)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-pencil-dim uppercase tracking-wide mb-0.5">Out</p>
                    <p className="tabular text-sm font-semibold text-brick">{formatMoney(job.expense)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-pencil-dim uppercase tracking-wide mb-0.5">Profit</p>
                    <p className={`tabular text-sm font-semibold ${job.profit >= 0 ? 'text-chalk' : 'text-brick'}`}>
                      {formatMoney(job.profit)}
                    </p>
                  </div>
                </div>

                {job.budget && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-pencil-dim mb-1">
                      <span>Spent of budget</span>
                      <span>{Math.min(100, Math.round((job.expense / job.budget) * 100))}%</span>
                    </div>
                    <div className="h-1.5 bg-ink rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${job.expense > job.budget ? 'bg-brick' : 'bg-copper'}`}
                        style={{ width: `${Math.min(100, (job.expense / job.budget) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end mt-2 text-pencil-dim group-hover:text-copper transition-colors">
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <JobFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (payload) => {
          const { error } = await createJob(payload)
          if (!error) setShowForm(false)
          return { error }
        }}
      />
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="border border-dashed border-rule rounded-lg py-16 flex flex-col items-center text-center">
      <p className="font-display font-semibold text-chalk mb-1">No jobs yet</p>
      <p className="text-sm text-pencil-dim mb-5 max-w-xs">
        Add your first job to start tracking what it pays and what it costs.
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-1.5 bg-copper hover:bg-copper-dim text-ink font-semibold text-sm px-4 py-2 rounded-md transition-colors"
      >
        <Plus size={16} strokeWidth={2.5} />
        New job
      </button>
    </div>
  )
}

function JobFormModal({ open, onClose, onSubmit }) {
  const empty = { name: '', client_name: '', address: '', budget: '', status: 'active', start_date: '', notes: '' }
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const reset = () => { setForm(empty); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Give the job a name.'); return }
    setBusy(true)
    const { error } = await onSubmit({
      name: form.name.trim(),
      client_name: form.client_name || null,
      address: form.address || null,
      budget: form.budget ? Number(form.budget) : null,
      status: form.status,
      start_date: form.start_date || null,
      notes: form.notes || null,
    })
    setBusy(false)
    if (error) setError(error.message || 'Could not save.')
    else reset()
  }

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} title="New job">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-pencil mb-1.5">Job name</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
            placeholder="Maple St kitchen remodel"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-pencil mb-1.5">Client</label>
            <input
              type="text" value={form.client_name}
              onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
              className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pencil mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk focus:border-copper transition-colors"
            >
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-pencil mb-1.5">Address</label>
          <input
            type="text" value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
            placeholder="Optional"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-pencil mb-1.5">Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil-dim text-sm">$</span>
              <input
                type="number" step="0.01" min="0" value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                className="w-full bg-ink border border-rule rounded-md pl-6 pr-3 py-2.5 text-sm tabular text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
                placeholder="Optional"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-pencil mb-1.5">Start date</label>
            <input
              type="date" value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk focus:border-copper transition-colors"
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-brick bg-brick/10 border border-brick/30 rounded-md px-3 py-2">{error}</p>
        )}
        <button
          type="submit" disabled={busy}
          className="w-full bg-copper hover:bg-copper-dim text-ink font-semibold text-sm py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          Create job
        </button>
      </form>
    </Modal>
  )
}
