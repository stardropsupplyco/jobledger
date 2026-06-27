import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, MapPin, User, Calendar, Trash2, Pencil } from 'lucide-react'
import { useJobs, useTransactions, useCategories } from '../lib/hooks'
import { formatMoney, formatDate } from '../lib/format'
import TransactionFormModal from '../components/TransactionFormModal'

export default function JobDetailPage({ jobId, onBack }) {
  const { jobs, updateJob, deleteJob } = useJobs()
  const { categories } = useCategories()
  const { transactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions({ jobId })
  const [showForm, setShowForm] = useState(false)
  const [editingTx, setEditingTx] = useState(null)

  const job = jobs.find((j) => j.id === jobId)

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return { income, expense, profit: income - expense }
  }, [transactions])

  const ledgerRows = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date) || a.created_at.localeCompare(b.created_at))
    let running = 0
    return sorted.map((t) => {
      running += t.type === 'income' ? Number(t.amount) : -Number(t.amount)
      return { ...t, running }
    }).reverse()
  }, [transactions])

  if (!job) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-pencil text-sm">Job not found.</p>
      </div>
    )
  }

  const handleDeleteJob = async () => {
    if (!confirm(`Delete "${job.name}"? This won't delete its transactions, but they'll become unassigned.`)) return
    await deleteJob(job.id)
    onBack()
  }

  return (
    <div className="h-screen overflow-y-auto">
      <header className="border-b border-rule sticky top-0 bg-ink/95 backdrop-blur z-10">
        <div className="h-16 flex items-center gap-3 px-8">
          <button onClick={onBack} className="text-pencil hover:text-chalk transition-colors p-1 -ml-1 rounded">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-lg text-chalk leading-none truncate">{job.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-pencil">
              {job.client_name && <span className="flex items-center gap-1"><User size={11} />{job.client_name}</span>}
              {job.address && <span className="flex items-center gap-1 truncate"><MapPin size={11} className="shrink-0" />{job.address}</span>}
              {job.start_date && <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(job.start_date)}</span>}
            </div>
          </div>
          <select
            value={job.status}
            onChange={(e) => updateJob(job.id, { status: e.target.value })}
            className="bg-surface border border-rule rounded-md px-2.5 py-1.5 text-xs font-medium text-chalk focus:border-copper transition-colors"
          >
            <option value="active">Active</option>
            <option value="on_hold">On hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-copper hover:bg-copper-dim text-ink font-semibold text-sm px-4 py-2 rounded-md transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add entry
          </button>
        </div>
      </header>

      <div className="p-8 max-w-4xl">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-rule rounded-lg p-4">
            <p className="text-[10px] text-pencil uppercase tracking-wide mb-1">Paid so far</p>
            <p className="tabular font-display font-bold text-xl text-sage">{formatMoney(totals.income)}</p>
          </div>
          <div className="bg-surface border border-rule rounded-lg p-4">
            <p className="text-[10px] text-pencil uppercase tracking-wide mb-1">Spent so far</p>
            <p className="tabular font-display font-bold text-xl text-brick">{formatMoney(totals.expense)}</p>
          </div>
          <div className="bg-surface border border-rule rounded-lg p-4">
            <p className="text-[10px] text-pencil uppercase tracking-wide mb-1">Profit</p>
            <p className={`tabular font-display font-bold text-xl ${totals.profit >= 0 ? 'text-chalk' : 'text-brick'}`}>
              {formatMoney(totals.profit)}
            </p>
          </div>
          <div className="bg-surface border border-rule rounded-lg p-4">
            <p className="text-[10px] text-pencil uppercase tracking-wide mb-1">Budget</p>
            <p className="tabular font-display font-bold text-xl text-chalk">
              {job.budget ? formatMoney(job.budget) : '—'}
            </p>
            {job.budget && (
              <p className="text-[10px] text-pencil-dim mt-0.5">
                {formatMoney(Math.max(0, job.budget - totals.expense))} left
              </p>
            )}
          </div>
        </div>

        <div className="bg-surface border border-rule rounded-lg overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-rule flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-chalk">Job ledger</h3>
            <span className="text-xs text-pencil-dim">{ledgerRows.length} {ledgerRows.length === 1 ? 'entry' : 'entries'}</span>
          </div>
          {ledgerRows.length === 0 ? (
            <p className="text-sm text-pencil-dim py-12 text-center">No entries for this job yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-pencil-dim uppercase tracking-wide border-b border-rule">
                  <th className="text-left font-medium px-5 py-2">Date</th>
                  <th className="text-left font-medium px-2 py-2">Description</th>
                  <th className="text-left font-medium px-2 py-2">Category</th>
                  <th className="text-right font-medium px-2 py-2">Amount</th>
                  <th className="text-right font-medium px-2 py-2">Balance</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.map((t) => (
                  <tr key={t.id} className="border-b border-rule last:border-0 hover:bg-surface-raised/50 group">
                    <td className="px-5 py-3 text-pencil whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-2 py-3 text-chalk">
                      {t.description || '—'}
                      {t.vendor_or_client && <span className="text-pencil-dim"> · {t.vendor_or_client}</span>}
                    </td>
                    <td className="px-2 py-3">
                      {t.categories ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-pencil">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.categories.color }} />
                          {t.categories.name}
                        </span>
                      ) : <span className="text-pencil-dim text-xs">—</span>}
                    </td>
                    <td className={`px-2 py-3 text-right tabular font-medium whitespace-nowrap ${t.type === 'income' ? 'text-sage' : 'text-brick'}`}>
                      {t.type === 'income' ? '+' : '−'}{formatMoney(t.amount)}
                    </td>
                    <td className="px-2 py-3 text-right tabular text-pencil whitespace-nowrap">{formatMoney(t.running)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingTx(t)} className="text-pencil hover:text-chalk p-1 rounded">
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this entry?')) deleteTransaction(t.id) }}
                          className="text-pencil hover:text-brick p-1 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {job.notes && (
          <div className="bg-surface border border-rule rounded-lg p-5 mb-6">
            <h3 className="font-display font-semibold text-sm text-chalk mb-2">Notes</h3>
            <p className="text-sm text-pencil whitespace-pre-wrap">{job.notes}</p>
          </div>
        )}

        <button
          onClick={handleDeleteJob}
          className="text-xs text-pencil-dim hover:text-brick transition-colors flex items-center gap-1.5"
        >
          <Trash2 size={12} />
          Delete this job
        </button>
      </div>

      <TransactionFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        jobs={jobs}
        categories={categories}
        defaultJobId={job.id}
        onSubmit={async (payload) => {
          const { error } = await createTransaction(payload)
          if (!error) setShowForm(false)
          return { error }
        }}
      />

      <TransactionFormModal
        open={!!editingTx}
        onClose={() => setEditingTx(null)}
        jobs={jobs}
        categories={categories}
        initial={editingTx ? {
          type: editingTx.type,
          amount: editingTx.amount,
          description: editingTx.description || '',
          vendor_or_client: editingTx.vendor_or_client || '',
          job_id: editingTx.job_id || '',
          category_id: editingTx.category_id || '',
          date: editingTx.date,
        } : null}
        onSubmit={async (payload) => {
          const { error } = await updateTransaction(editingTx.id, payload)
          if (!error) setEditingTx(null)
          return { error }
        }}
      />
    </div>
  )
}
