/**
 * Dashboard — KPI cards, sales trend chart, top products, recent alerts.
 * Redesigned to crypto staking aesthetic.
 */
import { useState, useEffect, useMemo } from 'react'
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
  const [timeRange, setTimeRange] = useState('24H')

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

  // Data for sparklines based on timeRange
  const { sparkline1, sparkline2 } = useMemo(() => {
    const points = timeRange === '24H' ? 6 : timeRange === '7D' ? 14 : 30
    return {
      sparkline1: generateSparkline(points, 50, 30),
      sparkline2: generateSparkline(points, 20, 10)
    }
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    )
  }

  const fmt = (n) => n?.toLocaleString() ?? '—'
  const fmtCurrency = (n) => n != null ? `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'

  const handleDismiss = (id) => {
    setLowStock((prev) => prev.filter((item) => item.id !== id))
    toast.success('Alert dismissed')
  }

  return (
    <div className="relative z-0">
      {/* Ambient Glassmorphic Glows */}
      <div className="fixed top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary-600/15 rounded-full blur-[140px] pointer-events-none -z-10 mix-blend-screen" />
      <div className="fixed bottom-[10%] right-[10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="space-y-8 animate-fade-in max-w-[1200px] mx-auto pb-12 relative z-10">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
        <h1 className="font-display font-medium text-2xl text-white tracking-wide">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          <button className="bg-primary-600/20 backdrop-blur-md hover:bg-primary-600/30 text-primary-400 px-5 py-2.5 rounded-full font-mono text-xs transition-colors border border-primary-600/20 flex items-center gap-2 shadow-[0_0_10px_rgba(169,85,255,0.15)]">
            <Activity size={14} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-xl text-white">Top Inventory Metrics</h2>
        <div className="flex bg-white/[0.05] backdrop-blur-md border border-white/[0.05] rounded-full p-1 shadow-inner">
          {['24H', '7D', '30D'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-full font-mono text-xs transition-colors ${
                timeRange === range
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-steel-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Crypto-Style KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="card p-6 relative overflow-hidden group bg-[rgba(60,100,220,0.1)] border-t-[rgba(120,180,255,0.4)]">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(100,160,255,0.2)]">
               <Package size={14} className="text-blue-400" />
             </div>
             <div>
               <div className="text-[10px] font-mono text-steel uppercase tracking-[0.2em]">Total Products</div>
             </div>
          </div>
          <div className="flex items-end justify-between z-10 relative">
            <div>
              <div className="font-display font-medium text-4xl text-white mb-2 tracking-tight">{fmt(stats?.total_products)}</div>
              <div className="text-[10px] font-mono text-success flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-success/10 border border-success/20">+4.2%</span> <TrendingUp size={12} /></div>
            </div>
            <div className="w-28 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline1}>
                   <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip cursor={false} content={<></>} />
                  <Area type="monotone" dataKey="val" stroke="#60A5FA" strokeWidth={2} fill="url(#g1)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card p-6 relative overflow-hidden bg-[rgba(200,140,30,0.08)] border-t-[rgba(245,158,11,0.4)]">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
               <AlertTriangle size={14} className="text-warning" />
             </div>
             <div>
               <div className="text-[10px] font-mono text-steel uppercase tracking-[0.2em]">Low Stock Alert</div>
             </div>
          </div>
          <div className="flex items-end justify-between z-10 relative">
            <div>
              <div className="font-display font-medium text-4xl text-white mb-2 tracking-tight">{fmt(stats?.low_stock_count)}</div>
              <div className="text-[10px] font-mono text-danger flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-danger/10 border border-danger/20">-1.5%</span> <TrendingUp size={12} className="rotate-180" /></div>
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

        {/* Card 3 */}
        <div className="card p-6 relative overflow-hidden bg-[rgba(100,50,200,0.12)] border-t-[rgba(160,120,255,0.4)] shadow-2xl">
           <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white/10 px-2.5 py-1 rounded text-[9px] uppercase font-mono font-black text-white border border-white/10">Active Audit</div>
                </div>
                <h3 className="font-display text-base font-bold text-white mb-2 tracking-wide">Inventory Value Portfolio</h3>
                <p className="text-[11px] text-steel font-mono mb-6 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/5">
                  Live valuation across all linked warehouses.
                </p>
                <div className="font-display font-black text-4xl text-white mb-8 drop-shadow-2xl">
                  {fmtCurrency(stats?.total_inventory_value)}
                </div>
              </div>
              <button className="w-full btn-primary gap-2 !py-3">
                <span className="font-mono text-[11px] font-black tracking-widest uppercase">Inspect Portfolio</span> <ChevronRight size={14} />
              </button>
           </div>
        </div>

      </div>

      {/* Lower Section: Action Needed */}
      <div className="mt-12 group/table">
        <h2 className="font-display font-bold text-2xl text-white mb-8 tracking-tight flex items-center gap-3">
          <div className="w-1.5 h-8 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(169,85,255,0.5)]" />
          Action Needed
        </h2>
        
        <div className="card overflow-hidden">
           {lowStock.length === 0 ? (
            <div className="p-12"><EmptyState icon={Package} message="All systems nominal. No stock alerts detected." /></div>
          ) : (
            <div className="">
              <div className="list-header hidden md:flex border-b border-white/10 bg-white/[0.02] px-8 py-5">
                <div className="w-2/5">Asset Detail</div>
                <div className="w-1/5 text-right">Available units</div>
                <div className="w-1/5 text-right">Threshold</div>
                <div className="w-1/5 text-center">Protocol Status</div>
                <div className="w-1/5 text-right">Directives</div>
              </div>
              
              <div className="divide-y divide-white/[0.03]">
                {lowStock.map((p) => (
                  <div key={p.id} className="list-row flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 px-8 py-6 hover:bg-white/[0.03] transition-colors relative group/row">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover/row:scale-y-100 transition-transform origin-top" />
                    
                    <div className="w-full md:w-2/5 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 shrink-0 shadow-inner group-hover/row:border-primary/20 transition-colors">
                        <Package size={20} className="text-steel group-hover/row:text-primary transition-colors" />
                      </div>
                      <div>
                        <div className="font-display font-bold text-white text-base mb-1">{p.name}</div>
                        <div className="text-[10px] font-mono text-steel uppercase tracking-[0.2em] font-medium">Ref: {p.sku}</div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-1/5 md:text-right font-display text-2xl font-black text-white tracking-tighter px-4">
                      {p.current_stock}
                    </div>
                    
                    <div className="w-full md:w-1/5 md:text-right text-steel font-mono text-xs uppercase tracking-widest px-4 font-bold">
                      {p.reorder_point ?? '—'}
                    </div>
                    
                    <div className="w-full md:w-1/5 md:text-center px-4">
                      {p.current_stock === 0
                        ? <span className="badge-danger">CRITICAL: EMPTY</span>
                        : <span className="badge-warning">WARNING: DEPLETING</span>
                      }
                    </div>
  
                    <div className="w-full md:w-1/5 flex justify-start md:justify-end gap-3 px-4">
                      <button className="btn-primary !px-5 !py-2 text-[11px] font-black uppercase tracking-widest">
                        Refill
                      </button>
                      <button 
                        onClick={() => handleDismiss(p.id)}
                        className="btn-ghost !px-4 !py-2 text-[10px] font-bold uppercase tracking-widest text-steel/60 hover:text-white"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)
}
