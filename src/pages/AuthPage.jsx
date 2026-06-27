import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { HardHat, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
        setInfo('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #F2EDE4 0px, #F2EDE4 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, #F2EDE4 0px, #F2EDE4 1px, transparent 1px, transparent 80px)',
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8 stamp-in">
          <div className="w-10 h-10 rounded bg-copper/15 border border-copper/30 flex items-center justify-center">
            <HardHat size={20} className="text-copper" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-chalk leading-none">
              JobLedger
            </h1>
            <p className="text-[11px] text-pencil tracking-wide mt-0.5">Money, by the job.</p>
          </div>
        </div>

        <div className="bg-surface border border-rule rounded-lg p-6">
          <div className="flex gap-1 mb-6 bg-ink rounded-md p-1">
            <button
              onClick={() => { setMode('signin'); setError(''); setInfo('') }}
              className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                mode === 'signin' ? 'bg-surface-raised text-chalk' : 'text-pencil hover:text-chalk'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setInfo('') }}
              className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                mode === 'signup' ? 'bg-surface-raised text-chalk' : 'text-pencil hover:text-chalk'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-pencil mb-1.5">Your name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
                  placeholder="Mike Sullivan"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-pencil mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
                placeholder="you@yourcompany.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-pencil mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink border border-rule rounded-md px-3 py-2.5 text-sm text-chalk placeholder:text-pencil-dim focus:border-copper transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-brick bg-brick/10 border border-brick/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-sage bg-sage/10 border border-sage/30 rounded-md px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-copper hover:bg-copper-dim text-ink font-semibold text-sm py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-pencil-dim mt-6">
          Track what every job pays, what it costs, and what's left.
        </p>
      </div>
    </div>
  )
}
