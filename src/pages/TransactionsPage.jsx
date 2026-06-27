import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { useJobs, useTransactions, useCategories } from '../lib/hooks'
import { formatMoney, formatDate } from '../lib/format'
import TransactionFormModal from '../components/TransactionFormModal'

export default function TransactionsPage() {
  const { jobs } = useJobs()
  const { categories } = useCategories()
  const [typeFilter, setTypeFilter] = useState('')
  const [jobFilter, setJobFilter] = useState('')
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } = useTransactions({
    type: typeFilter || undefined,
    jobId: jobFilter || undefined,
  })
  const [showForm, setShowForm] = useState(false)
  const [editingTx, setEditingTx] = useState(null)

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return { income, expense, net: income - expense }
  }, [transactions])

  return (
    <div className="h-screen overflow-y-auto">
      <header className="h-16 border-b border-rule flex items-center justify-between px-8 sticky top-0 bg-ink/95 backdrop-blur z-10">
        <div>
          <h1 className="font-display font-bold text-lg text-chalk leading-none">Ledger</h1>
          <p className="text-xs text-pencil mt-0.5">Every dollar in, every dollar out.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-copper hover:bg-copper-dim text-ink font-semibold text-sm px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add entry
        </button>
      </header>

      <div className="p-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-surface border border-rule rounded-md px-3 py-2 text-sm text-chalk focus:border-copper transition-colors"
          >
            <option value="">All types</option>
            <option value="income">Money in</option>
            <option value="expense">Money out</option>
          </select>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="bg-surface border border-rule rounded-md px-3 py-2 text-sm text-chalk focus:border-copper transition-colors"
          >
            <option value="">All jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-pencil">In <span className="tabular text-sage font-semibold">{formatMoney(totals.income)}</span></span>
            <span className="text-pencil">Out <span className="tabular text-brick font-semibold">{formatMoney(totals.expense)}</span></span>
            <span className="text-pencil">Net <span className={`tabular font-semibold ${totals.net >= 0 ? 'text-chalk' : 'text-brick'}`}>{formatMoney(totals.net)}</span></span>
          </div>
        </div>

        <div className="bg-surface border border-rule rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-pencil" /></div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-pencil-dim py-16 text-center">No entries match these filters.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-pencil-dim uppercase tracking-wide border-b border-rule">
                  <th className="text-left font-medium px-5 py-2">Date</th>
                  <th className="text-left font-medium px-2 py-2">Description</th>
                  <th className="text-left font-medium px-2 py-2">Job</th>
                  <th className="text-left font-medium px-2 py-2">Category</th>
                  <th className="text-right font-medium px-2 py-2">Amount</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-rule last:border-0 hover:bg-surface-raised/50 group">
                    <td className="px-5 py-3 text-pencil whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-2 py-3 text-chalk">
                      {t.description || '—'}
                      {t.vendor_or_client && <span className="text-pencil-dim"> · {t.vendor_or_client}</span>}
                    </td>
                    <td className="px-2 py-3 text-pencil">
                      {t.jobs?.name || <span className="text-pencil-dim">General</span>}
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
      </div>

      <TransactionFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        jobs={jobs}
        categories={categories}
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
