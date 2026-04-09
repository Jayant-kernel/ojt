/**
 * Dashboard — KPI cards, sales trend chart, top products, recent alerts.
 * Redesigned to crypto staking aesthetic.
 */
import { useState, useEffect } from 'react'
import { Package, AlertTriangle, DollarSign, Wallet, TrendingUp, ChevronRight, Activity } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { productsApi } from '../api/services'
import { Spinner, EmptyState } from '../components/ui'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'

// Mock sparkline data
function generateSparkline(days = 7, baseline = 100, variance = 20) {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
    val: Math.max(0, baseline + (Math.random() - 0.5) * variance),
  }))
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productsApi.dashboardStats(),
      productsApi.lowStock(),
    ])
      .then(([s, ls]) => {
        setStats(s)
        setLowStock(ls.slice(0, 5))
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    )
  }

  const fmt = (n) => n?.toLocaleString() ?? '—'
  const fmtCurrency = (n) => n != null ? `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'

  // Data for sparklines
  const sparkline1 = generateSparkline(10, 50, 30) // Inventory value trend
  const sparkline2 = generateSparkline(10, 20, 10) // Restock rate

  return (
    <div className="space-y-8 animate-fade-in max-w-[1200px] mx-auto">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
        <h1 className="font-display font-medium text-2xl text-white tracking-wide">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          <button className="bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 px-5 py-2.5 rounded-full font-mono text-xs transition-colors border border-primary-600/20 flex items-center gap-2 shadow-[0_0_10px_rgba(169,85,255,0.15)]">
            <Activity size={14} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-xl text-white">Top Inventory Metrics</h2>
        <div className="flex bg-ink-900 border border-white/[0.05] rounded-full p-1 shadow-inner">
          <button className="px-4 py-1.5 rounded-full bg-white/10 text-white font-mono text-xs shadow-sm">24H</button>
          <button className="px-4 py-1.5 rounded-full text-steel-400 hover:text-white font-mono text-xs transition-colors">7D</button>
          <button className="px-4 py-1.5 rounded-full text-steel-400 hover:text-white font-mono text-xs transition-colors">30D</button>
        </div>
      </div>

      {/* Crypto-Style KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="card p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary-500 to-transparent opacity-70"></div>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/30 shadow-[0_0_10px_rgba(169,85,255,0.15)]">
               <Package size={14} className="text-primary-400" />
             </div>
             <div>
               <div className="text-[10px] font-mono text-steel-400 uppercase tracking-widest">Total Products</div>
             </div>
          </div>
          <div className="flex items-end justify-between z-10 relative">
            <div>
              <div className="font-display font-bold text-3xl text-white mb-2">{fmt(stats?.total_products)}</div>
              <div className="text-[10px] font-mono text-success flex items-center gap-1"><span className="px-1.5 py-0.5 rounded-sm bg-success/10">+4.2%</span> <TrendingUp size={12} /></div>
            </div>
            <div className="w-28 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline1}>
                   <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A955FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#A955FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={false} content={<></>} />
                  <Area type="monotone" dataKey="val" stroke="#A955FF" strokeWidth={2} fill="url(#g1)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-warning to-transparent opacity-70"></div>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center border border-warning/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
               <AlertTriangle size={14} className="text-warning" />
             </div>
             <div>
               <div className="text-[10px] font-mono text-steel-400 uppercase tracking-widest">Low Stock Alert</div>
             </div>
          </div>
          <div className="flex items-end justify-between z-10 relative">
            <div>
              <div className="font-display font-bold text-3xl text-white mb-2">{fmt(stats?.low_stock_count)}</div>
              <div className="text-[10px] font-mono text-danger flex items-center gap-1"><span className="px-1.5 py-0.5 rounded-sm bg-danger/10">-1.5%</span> <TrendingUp size={12} className="rotate-180" /></div>
            </div>
            <div className="w-28 h-12">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline2}>
                   <defs>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={false} content={<></>} />
                  <Area type="monotone" dataKey="val" stroke="#F59E0B" strokeWidth={2} fill="url(#g2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 3 - Replaces Liquid Staking Callout */}
        <div className="card p-6 relative overflow-hidden bg-gradient-to-br from-[#26174a] to-[#0D0B14] border border-primary-500/20 shadow-2xl">
           <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary-500 rounded-full blur-[70px] opacity-30"></div>
           <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[magenta] rounded-full blur-[80px] opacity-20"></div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-primary-500 px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold text-white shadow-md">Summary</div>
                </div>
                <h3 className="font-display text-base font-bold text-white mb-1.5 tracking-wide">Inventory Value Portfolio</h3>
                <p className="text-[11px] text-steel-400 font-mono mb-6 leading-relaxed bg-ink-950/20 p-2 rounded-lg border border-white/5">
                  Real-time sync of asset value. Total cost base across all units.
                </p>
                <div className="font-display font-bold text-3xl text-white mb-6 drop-shadow-md">
                  {fmtCurrency(stats?.total_inventory_value)}
                </div>
              </div>
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-[11px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2 backdrop-blur-md">
                View Full Audit <ChevronRight size={14} />
              </button>
           </div>
        </div>

      </div>

      {/* Lower Section: "Active Stakings" equivalent -> Low Stock Alerts */}
      <div className="mt-12">
        <h2 className="font-display font-semibold text-xl text-white mb-6 tracking-wide">Action Needed (Low Stock)</h2>
        
        <div className="card p-6">
           {lowStock.length === 0 ? (
            <EmptyState icon={Package} message="All products are adequately stocked" />
          ) : (
            <div className="space-y-3">
              <div className="list-header hidden md:flex px-4">
                <div className="w-2/5">Product Detail</div>
                <div className="w-1/5 text-right">Current Stock</div>
                <div className="w-1/5 text-right">Reorder Point</div>
                <div className="w-1/5 text-center">Status</div>
                <div className="w-1/5 text-right">Actions</div>
              </div>
              
              {lowStock.map((p) => (
                <div key={p.id} className="list-row flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 bg-ink-900/60 border border-white/[0.04]">
                  <div className="w-full md:w-2/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-ink-800 flex items-center justify-center border border-white/[0.08] shrink-0 shadow-inner">
                      <Package size={16} className="text-steel-300" />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-white text-sm mb-0.5">{p.name}</div>
                      <div className="text-steel-400 text-[10px] font-mono tracking-widest uppercase">SKU: {p.sku}</div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/5 md:text-right font-display text-xl font-bold text-white tracking-widest px-4">
                    {p.current_stock}
                  </div>
                  
                  <div className="w-full md:w-1/5 md:text-right text-steel-400 font-mono text-[11px] uppercase tracking-widest px-4">
                    {p.reorder_point ?? '—'}
                  </div>
                  
                  <div className="w-full md:w-1/5 md:text-center px-4">
                    {p.current_stock === 0
                      ? <span className="badge-danger bg-danger/20">Out of stock</span>
                      : <span className="badge-warning bg-warning/20">Restock needed</span>
                    }
                  </div>

                  <div className="w-full md:w-1/5 flex justify-start md:justify-end gap-2 px-4">
                    <button className="bg-primary-500 hover:bg-primary-400 text-white shadow-lg shadow-primary-500/30 text-[10px] uppercase font-display font-bold px-4 py-2 rounded-lg transition-all active:scale-95 border border-primary-400">
                      Order
                    </button>
                    <button className="bg-transparent hover:bg-white/10 text-steel-300 text-[10px] uppercase font-display font-medium px-4 py-2 rounded-lg border border-white/20 transition-all">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
