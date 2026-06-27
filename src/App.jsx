import { useState } from 'react'
import { Loader2, HardHat } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import Shell from './components/Shell'
import OverviewPage from './pages/OverviewPage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import TransactionsPage from './pages/TransactionsPage'
import CategoriesPage from './pages/CategoriesPage'

function AppContent() {
  const { user, loading } = useAuth()
  const [view, setView] = useState('overview')
  const [activeJobId, setActiveJobId] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded bg-copper/15 border border-copper/30 flex items-center justify-center">
          <HardHat size={20} className="text-copper" strokeWidth={2} />
        </div>
        <Loader2 className="animate-spin text-pencil" size={18} />
      </div>
    )
  }

  if (!user) return <AuthPage />

  const navigate = (id) => {
    setView(id)
    setActiveJobId(null)
  }

  const openJob = (jobId) => {
    setActiveJobId(jobId)
    setView('jobs')
  }

  let page
  if (view === 'jobs' && activeJobId) {
    page = <JobDetailPage jobId={activeJobId} onBack={() => setActiveJobId(null)} />
  } else if (view === 'jobs') {
    page = <JobsPage onOpenJob={openJob} />
  } else if (view === 'transactions') {
    page = <TransactionsPage />
  } else if (view === 'categories') {
    page = <CategoriesPage />
  } else {
    page = <OverviewPage />
  }

  return (
    <Shell active={view} onNavigate={navigate}>
      {page}
    </Shell>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
