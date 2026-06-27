import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} bg-surface border border-rule rounded-lg shadow-2xl stamp-in max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule sticky top-0 bg-surface">
          <h2 className="font-display font-bold text-base text-chalk">{title}</h2>
          <button
            onClick={onClose}
            className="text-pencil hover:text-chalk transition-colors p-1 -mr-1 rounded"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
