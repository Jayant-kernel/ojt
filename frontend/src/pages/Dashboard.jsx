/**
 * Dashboard — KPI cards, sales trend chart, top products, recent alerts.
 */
import { useState, useEffect } from 'react'
import { Package, AlertTriangle, DollarSign, TrendingUp, BarChart2, ShoppingCart } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { productsApi, salesApi } from '../api/services'
import { KpiCard, SectionCard, Spinner, EmptyState } from '../components/ui'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'

// Custom chart tooltip
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-md px-3 py-2 shadow-xl">
      <p className="font-mono text-[10px] text-steel-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  )
}

// Generate mock sparkline data when API doesn't have sales yet
function generateMockSales(days = 30) {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
    revenue: Math.floor(Math.random() * 8000 + 2000),
    units: Math.floor(Math.random() * 120 + 20),
  }))
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productsApi.dashboardStats(),
      productsApi.lowStock(),
    ])
      .then(([s, ls]) => {
        setStats(s)
        setLowStock(ls.slice(0, 5))
        setSalesData(generateMockSales(30))
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={24} />
      </div>
    )
  }

  const fmt = (n) => n?.toLocaleString() ?? '—'
  const fmtCurrency = (n) => n != null ? `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display font-bold text-2xl text-white">Dashboard</h1>
        <p className="font-mono text-xs text-steel-400 mt-1">
          {format(new Date(), 'EEEE, MMMM d yyyy')} — Real-time inventory overview
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Products"
          value={fmt(stats?.total_products)}
          icon={Package}
          accent
          delay={0}
        />
        <KpiCard
          label="Low Stock Items"
          value={fmt(stats?.low_stock_count)}
          sub="Below reorder point"
          icon={AlertTriangle}
          delay={50}
        />
        <KpiCard
          label="Out of Stock"
          value={fmt(stats?.out_of_stock_count)}
          sub="Needs immediate action"
          icon={ShoppingCart}
          delay={100}
        />
        <KpiCard
          label="Inventory Value"
          value={fmtCurrency(stats?.total_inventory_value)}
          sub="At cost price"
          icon={DollarSign}
          delay={150}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Sales Trend */}
        <SectionCard title="Revenue Trend — 30d" className="col-span-2 animate-slide-up stagger-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="2596be" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="2596be" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2533" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                width={45}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="2596be"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Units chart */}
        <SectionCard title="Units Sold" className="animate-slide-up stagger-3">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData.slice(-10)} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2533" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="units" name="Units" fill="#3D4F6B" radius={[2, 2, 0, 0]} activeBar={{ fill: '2596be' }} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Low Stock Alert Table */}
      <SectionCard
        title="Low Stock Alerts"
        className="animate-slide-up stagger-4"
        action={
          <a href="/alerts" className="font-mono text-xs text-amber-400 hover:underline">
            View all →
          </a>
        }
      >
        {lowStock.length === 0 ? (
          <EmptyState icon={Package} message="All products are adequately stocked" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 pb-2">Product</th>
                <th className="text-left px-4 pb-2">SKU</th>
                <th className="text-right px-4 pb-2">Stock</th>
                <th className="text-right px-4 pb-2">Reorder At</th>
                <th className="text-right px-4 pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell font-display font-semibold text-white text-xs">{p.name}</td>
                  <td className="table-cell text-steel-400">{p.sku}</td>
                  <td className="table-cell text-right">
                    <span className={p.current_stock === 0 ? 'text-red-400' : 'text-amber-400'}>
                      {p.current_stock}
                    </span>
                  </td>
                  <td className="table-cell text-right text-steel-400">{p.reorder_point ?? '—'}</td>
                  <td className="table-cell text-right">
                    {p.current_stock === 0
                      ? <span className="badge-danger">Out</span>
                      : <span className="badge-warning">Low</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  )
}
