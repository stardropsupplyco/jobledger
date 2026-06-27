import { useEffect, useState } from 'react'
import Modal from './Modal'
import { todayISO } from '../lib/format'
import { Loader2 } from 'lucide-react'

const empty = {
  type: 'income',
  amount: '',
  description: '',
  vendor_or_client: '',
  job_id: '',
  category_id: '',
  date: todayISO(),
}

export default function TransactionFormModal({ open, onClose, jobs, categories, onSubmit, defaultJobId, initial }) {
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...empty, ...initial } : { ...empty, job_id: defaultJobId || '' })
      setError('')
    }
  }, [open, defaultJobId, initial])

  const filteredCategories = categories.filter((c) => c.type === form.type)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    setBusy(true)
    const payload = {
      type: form.type,
      amount: Number(form.amount),
      description: form.description || null,
      vendor_or_client: form.vendor_or_client || null,
      job_id: form.job_id || null,
      category_id: form.category_id || null,
      date: form.date,
    }
    const { error } = await onSubmit(payload)
    setBusy(false)
    if (error) setError(error.message || 'Could not save. Try again.')
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit entry' : 'Add entry'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-1 bg-ink rounded-md p-1">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: 'income', category_id: '' }))}
            className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${
              form.type === 'income' ? 'bg-sage/20 text-sage' : 'text-pencil hover:text-chalk'
            }`}
          >
            Money in
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: 'expense', category_id: '' }))}
            className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${
              form.type === 'expense' ? 'bg-brick/20 text-brick' : 'text-pencil hover:text-chalk'
            }`}
          >
            Money out
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-pencil mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pencil-dim text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full bg-ink border border-rule rounded-md pl-6 pr-3 py-2.5 text-sm tabular text-chalk focus:border-copper transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-pencil mb-1.5">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk focus:border-copper transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-pencil mb-1.5">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
            placeholder={form.type === 'income' ? 'Deposit, draw, final payment...' : 'Lumber run, framer invoice...'}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-pencil mb-1.5">
            {form.type === 'income' ? 'Client' : 'Vendor / sub'}
          </label>
          <input
            type="text"
            value={form.vendor_or_client}
            onChange={(e) => setForm((f) => ({ ...f, vendor_or_client: e.target.value }))}
            className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
            placeholder="Optional"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-pencil mb-1.5">Job</label>
            <select
              value={form.job_id}
              onChange={(e) => setForm((f) => ({ ...f, job_id: e.target.value }))}
              className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk focus:border-copper transition-colors"
            >
              <option value="">No job (general)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pencil mb-1.5">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk focus:border-copper transition-colors"
            >
              <option value="">Uncategorized</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-brick bg-brick/10 border border-brick/30 rounded-md px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-copper hover:bg-copper-dim text-ink font-semibold text-sm py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          Save entry
        </button>
      </form>
    </Modal>
  )
}
