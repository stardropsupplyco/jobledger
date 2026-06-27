import { useState } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { useCategories } from '../lib/hooks'
import Modal from '../components/Modal'

const SWATCHES = ['#D97A3F', '#7C9A6B', '#B5564A', '#5B7C99', '#A855F7', '#EAB308', '#06B6D4', '#94A3B8']

export default function CategoriesPage() {
  const { categories, loading, createCategory, deleteCategory } = useCategories()
  const [showForm, setShowForm] = useState(false)

  const income = categories.filter((c) => c.type === 'income')
  const expense = categories.filter((c) => c.type === 'expense')

  return (
    <div className="h-screen overflow-y-auto">
      <header className="h-16 border-b border-rule flex items-center justify-between px-8 sticky top-0 bg-ink/95 backdrop-blur z-10">
        <div>
          <h1 className="font-display font-bold text-lg text-chalk leading-none">Categories</h1>
          <p className="text-xs text-pencil mt-0.5">How your money gets sorted.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-copper hover:bg-copper-dim text-ink font-semibold text-sm px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          New category
        </button>
      </header>

      <div className="p-8 max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-pencil" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <CategoryColumn title="Income" items={income} onDelete={deleteCategory} accent="text-sage" />
            <CategoryColumn title="Expense" items={expense} onDelete={deleteCategory} accent="text-brick" />
          </div>
        )}
      </div>

      <CategoryFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (payload) => {
          const { error } = await createCategory(payload)
          if (!error) setShowForm(false)
          return { error }
        }}
      />
    </div>
  )
}

function CategoryColumn({ title, items, onDelete, accent }) {
  return (
    <div className="bg-surface border border-rule rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-rule">
        <h3 className={`font-display font-semibold text-sm ${accent}`}>{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-pencil-dim py-8 text-center">None yet</p>
      ) : (
        <div>
          {items.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3 border-b border-rule last:border-0 group">
              <span className="flex items-center gap-2.5 text-sm text-chalk">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                {c.name}
              </span>
              {!c.is_default && (
                <button
                  onClick={() => { if (confirm(`Delete "${c.name}"?`)) onDelete(c.id) }}
                  className="text-pencil-dim hover:text-brick p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryFormModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [color, setColor] = useState(SWATCHES[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const reset = () => { setName(''); setType('expense'); setColor(SWATCHES[0]); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Give the category a name.'); return }
    setBusy(true)
    setError('')
    const { error } = await onSubmit({ name: name.trim(), type, color })
    setBusy(false)
    if (error) setError(error.message?.includes('duplicate') ? 'You already have a category with this name.' : 'Could not save.')
    else reset()
  }

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} title="New category">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-1 bg-ink rounded-md p-1">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${type === 'income' ? 'bg-sage/20 text-sage' : 'text-pencil hover:text-chalk'}`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-sm font-semibold rounded transition-colors ${type === 'expense' ? 'bg-brick/20 text-brick' : 'text-pencil hover:text-chalk'}`}
          >
            Expense
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-pencil mb-1.5">Name</label>
          <input
            type="text" required value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
            placeholder={type === 'income' ? 'Deposit' : 'Dumpster rental'}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-pencil mb-1.5">Color</label>
          <div className="flex gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c} type="button" onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface ring-chalk scale-105' : ''}`}
                style={{ background: c }}
              />
            ))}
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
          Create category
        </button>
      </form>
    </Modal>
  )
}
