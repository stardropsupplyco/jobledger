import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useJobs, useTransactions, useCategories } from '../lib/hooks'
import { formatMoney, formatDateShort } from '../lib/format'
import TransactionFormModal from '../components/TransactionFormModal'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'

export default function OverviewPage() {
  const { jobs } = useJobs()
  const { transactions, loading, createTransaction } = useTransactions()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)

  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return { income, expense, net: income - expense }
  }, [transactions])

  const monthlySeries = useMemo(() => {
    const map = new Map()
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      map.set(key, { label: d.toLocaleDateString('en-US', { month: 'short' }), income: 0, expense: 0 })
    }
    transactions.forEach((t) => {
      const d = new Date(t.date + 'T00:00:00')
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (map.has(key)) {
        const entry = map.get(key)
        if (t.type === 'income') entry.income += Number(t.amount)
        else entry.expense += Number(t.amount)
      }
    })
    return Array.from(map.values())
  }, [transactions])

  const expenseByCategory = useMemo(() => {
    const map = new Map()
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      const name = t.categories?.name || 'Uncategorized'
      const color = t.categories?.color || '#94a3b8'
      const cur = map.get(name) || { name, value: 0, color }
      cur.value += Number(t.amount)
      map.set(name, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [transactions])

  const jobProfit = useMemo(() => {
    return jobs.map((job) => {
      const jobTx = transactions.filter((t) => t.job_id === job.id)
      const income = jobTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const expense = jobTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      return { ...job, income, expense, profit: income - expense }
    }).sort((a, b) => b.profit - a.profit).slice(0, 5)
  }, [jobs, transactions])

  const recentTx = transactions.slice(0, 6)

  return (
    <div className="h-screen overflow-y-auto">
      <header className="h-16 border-b border-rule flex items-center justify-between px-8 sticky top-0 bg-ink/95 backdrop-blur z-10">
        <div>
          <h1 className="font-display font-bold text-lg text-chalk leading-none">Overview</h1>
          <p className="text-xs text-pencil mt-0.5">Where your money's coming from and going.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-copper hover:bg-copper-dim text-ink font-semibold text-sm px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add entry
        </button>
      </header>

      <div className="p-8 space-y-8 max-w-6xl">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total in"
            value={stats.income}
            icon={ArrowUpRight}
            tone="sage"
          />
          <StatCard
            label="Total out"
            value={stats.expense}
            icon={ArrowDownRight}
            tone="brick"
          />
          <StatCard
            label="Net"
            value={stats.net}
            icon={Wallet}
            tone={stats.net >= 0 ? 'copper' : 'brick'}
            emphasis
          />
        </div>

        {/* Chart + category breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-surface border border-rule rounded-lg p-5">
            <h3 className="font-display font-semibold text-sm text-chalk mb-4">Last 6 months</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlySeries} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C9A6B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7C9A6B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B5564A" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#B5564A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#3A352F" vertical={false} />
                <XAxis dataKey="label" stroke="#6B6359" tick={{ fill: '#9A9085', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6B6359" tick={{ fill: '#9A9085', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000) + 'k' : v}`} width={48} />
                <Tooltip
                  contentStyle={{ background: '#2D2925', border: '1px solid #4A4339', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#F2EDE4', fontWeight: 600 }}
                  formatter={(v) => formatMoney(v)}
                />
                <Area type="monotone" dataKey="income" stroke="#7C9A6B" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#B5564A" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-rule rounded-lg p-5">
            <h3 className="font-display font-semibold text-sm text-chalk mb-4">Expense breakdown</h3>
            {expenseByCategory.length === 0 ? (
              <p className="text-sm text-pencil-dim py-8 text-center">No expenses yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={38} outerRadius={58} paddingAngle={2}>
                      {expenseByCategory.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {expenseByCategory.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-pencil truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span className="tabular text-chalk font-medium">{formatMoney(c.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Job profit + recent activity */}
        <div className="grid grid-cols-2 gap-4 pb-8">
          <div className="bg-surface border border-rule rounded-lg p-5">
            <h3 className="font-display font-semibold text-sm text-chalk mb-4">Top jobs by profit</h3>
            {jobProfit.length === 0 ? (
              <p className="text-sm text-pencil-dim py-6 text-center">No jobs yet</p>
            ) : (
              <div className="space-y-3">
                {jobProfit.map((job) => (
                  <div key={job.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-chalk font-medium truncate">{job.name}</p>
                      <p className="text-xs text-pencil-dim">
                        {formatMoney(job.income)} in · {formatMoney(job.expense)} out
                      </p>
                    </div>
                    <span className={`tabular text-sm font-semibold ml-3 ${job.profit >= 0 ? 'text-sage' : 'text-brick'}`}>
                      {job.profit >= 0 ? '+' : ''}{formatMoney(job.profit)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface border border-rule rounded-lg p-5">
            <h3 className="font-display font-semibold text-sm text-chalk mb-4">Recent activity</h3>
            {recentTx.length === 0 ? (
              <p className="text-sm text-pencil-dim py-6 text-center">Nothing logged yet</p>
            ) : (
              <div className="space-y-3">
                {recentTx.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-chalk font-medium truncate">
                        {t.description || t.categories?.name || (t.type === 'income' ? 'Income' : 'Expense')}
                      </p>
                      <p className="text-xs text-pencil-dim">
                        {formatDateShort(t.date)}{t.jobs?.name ? ` · ${t.jobs.name}` : ''}
                      </p>
                    </div>
                    <span className={`tabular text-sm font-semibold ml-3 ${t.type === 'income' ? 'text-sage' : 'text-brick'}`}>
                      {t.type === 'income' ? '+' : '−'}{formatMoney(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
    </div>
  )
}

function StatCard({ label, value, icon: Icon, tone, emphasis }) {
  const toneMap = {
    sage: 'text-sage bg-sage/10 border-sage/25',
    brick: 'text-brick bg-brick/10 border-brick/25',
    copper: 'text-copper bg-copper/10 border-copper/25',
  }
  return (
    <div className={`bg-surface border rounded-lg p-5 ${emphasis ? 'border-rule-strong' : 'border-rule'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-pencil uppercase tracking-wide">{label}</span>
        <div className={`w-7 h-7 rounded-md border flex items-center justify-center ${toneMap[tone]}`}>
          <Icon size={14} strokeWidth={2.25} />
        </div>
      </div>
      <p className={`font-display font-bold text-2xl tabular ${tone === 'brick' && value < 0 ? 'text-brick' : 'text-chalk'}`}>
        {formatMoney(value)}
      </p>
    </div>
  )
}
