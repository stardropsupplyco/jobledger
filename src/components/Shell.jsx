import { HardHat, LayoutGrid, Receipt, Briefcase, Tags, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'transactions', label: 'Ledger', icon: Receipt },
  { id: 'categories', label: 'Categories', icon: Tags },
]

export default function Shell({ active, onNavigate, children }) {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-ink flex">
      <aside className="w-60 shrink-0 border-r border-rule flex flex-col bg-surface/40">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-rule">
          <div className="w-8 h-8 rounded bg-copper/15 border border-copper/30 flex items-center justify-center shrink-0">
            <HardHat size={16} className="text-copper" strokeWidth={2} />
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight text-chalk">
            JobLedger
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-copper/12 text-copper'
                    : 'text-pencil hover:text-chalk hover:bg-surface-raised'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.25 : 1.75} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-rule">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm text-chalk font-medium truncate">
              {profile?.full_name || profile?.business_name || 'Your account'}
            </p>
            {profile?.business_name && profile?.full_name && (
              <p className="text-xs text-pencil-dim truncate">{profile.business_name}</p>
            )}
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-pencil hover:text-brick hover:bg-brick/10 transition-colors"
          >
            <LogOut size={15} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
