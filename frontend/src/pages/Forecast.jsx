/**
 * Forecast page — select a product, trigger forecast, display predictions + metrics.
 */
import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, Zap, BarChart2, Database, Layers, X, LineChart, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Brush
} from 'recharts'
import { productsApi, forecastsApi, inventoryApi } from '../api/services'
import { PageHeader, SectionCard, Spinner, EmptyState, Field, KpiCard } from '../components/ui'
import toast from 'react-hot-toast'

// ---------------------------------------------------------------------------
// Chart Tooltip
// ---------------------------------------------------------------------------
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl px-4 py-3 shadow-2xl">
      <p className="font-mono text-[10px] text-steel-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProductSalesModal — shows weekly sales history from sales_history table
// ---------------------------------------------------------------------------
const ProductSalesModal = ({ product, isOpen, onClose }) => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState({ startIndex: 0, endIndex: 11 })

  useEffect(() => {
    if (!isOpen || !product) {
      setSales([])
      return
    }
    setLoading(true)
    // product.sku is the product_id stored in sales_history
    inventoryApi.getProductSales(product.sku)
      .then(data => {
        // API should return [{ week: '2025-W03', sales: 214 }, ...]
        setSales(data)
        if (data.length > 0) {
          setRange({ startIndex: 0, endIndex: Math.min(11, data.length - 1) })
        }
      })
      .catch(() => toast.error('Failed to load sales history'))
      .finally(() => setLoading(false))
  }, [isOpen, product])

  const handleScroll = (dir) => {
    const shift = 4
    const len = sales.length
    if (len === 0) return
    if (dir === 'left') {
      const nextStart = Math.max(0, range.startIndex - shift)
      const diff = range.endIndex - range.startIndex
      setRange({ startIndex: nextStart, endIndex: Math.min(len - 1, nextStart + diff) })
    } else {
      const nextEnd = Math.min(len - 1, range.endIndex + shift)
      const diff = range.endIndex - range.startIndex
      setRange({ startIndex: Math.max(0, nextEnd - diff), endIndex: nextEnd })
    }
  }

  const handleWheel = (e) => {
    if (e.deltaY > 0) handleScroll('right')
    else handleScroll('left')
  }

  if (!isOpen) return null

  const peakValue   = sales.length > 0 ? Math.max(...sales.map(s => s.sales)) : 0
  const totalSales  = sales.reduce((acc, curr) => acc + curr.sales, 0)
  const avgSales    = sales.length > 0 ? (totalSales / sales.length).toFixed(1) : '0'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in shadow-2xl">
      <div className="card w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-600 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-white leading-tight">{product?.name}</h3>
            <p className="text-[10px] font-mono text-steel-400 uppercase tracking-widest">
              {product?.sku} • {product?.category}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl text-steel hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
              <Spinner size={32} />
              <p className="font-mono text-xs text-steel-400">Loading weekly sales data…</p>
            </div>
          ) : sales.length > 0 ? (
            <div className="space-y-6">
              <div
                className="h-[400px] w-full relative group"
                onWheel={handleWheel}
              >
                {/* Nav buttons */}
                <div className="absolute inset-y-0 left-0 flex items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleScroll('left')}
                    className="p-3 ml-2 bg-white/5 border border-white/10 rounded-full text-white hover:bg-blue-500/40 transition-all shadow-2xl backdrop-blur-md"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleScroll('right')}
                    className="p-3 mr-2 bg-white/5 border border-white/10 rounded-full text-white hover:bg-blue-500/40 transition-all shadow-2xl backdrop-blur-md"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sales} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2533" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      name="Weekly Sales"
                      stroke="#fbbf24"
                      strokeWidth={3}
                      fill="url(#salesGrad)"
                      dot={{ r: 2, fill: '#fbbf24' }}
                      activeDot={{ r: 6, fill: '#fbbf24', strokeWidth: 0 }}
                      animationDuration={500}
                    />
                    <Brush
                      dataKey="week"
                      height={30}
                      stroke="#475569"
                      fill="#0f172a"
                      startIndex={range.startIndex}
                      endIndex={range.endIndex}
                      onChange={(obj) => setRange(obj)}
                      travellerWidth={10}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4">
                <KpiCard label="Peak Week"   value={peakValue}   sub="Highest units sold"  icon={TrendingUp} delay={0}   />
                <KpiCard label="Average"     value={avgSales}    sub="Units per week"       icon={Layers}     delay={50}  />
                <KpiCard label="Total Sales" value={totalSales}  sub="Total units sold"     icon={Database}   accent delay={100} />
                <KpiCard label="Weeks"       value={sales.length} sub="Data points"         icon={BarChart2}  delay={150} />
              </div>
            </div>
          ) : (
            <div className="py-20">
              <EmptyState
                icon={BarChart2}
                message="No sales history found"
                sub={`No rows in sales_history for SKU ${product?.sku}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Forecast page
// ---------------------------------------------------------------------------
export default function Forecast() {
  const [products, setProducts]   = useState([])
  const [productId, setProductId] = useState('')
  const [horizon, setHorizon]     = useState(90)
  const [loading, setLoading]     = useState(false)
  const [forecast, setForecast]   = useState(null)

  const [mode, setMode]                 = useState('forecast') // 'forecast' | 'dataset'
  const [dataset, setDataset]           = useState([])
  const [activeMetric, setActiveMetric] = useState('current_stock')

  const [selectedProductForModal, setSelectedProductForModal] = useState(null)
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [showAllRows, setShowAllRows]   = useState(false)
  const [productSearch, setProductSearch] = useState('')

  // Filter products list by search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products
    const s = productSearch.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s)
    )
  }, [products, productSearch])

  // Load products on mount
  useEffect(() => {
    forecastsApi.getProducts()
      .then(d => setProducts(d))
      .catch(() => toast.error('Failed to load products'))
  }, [])

  // Load dataset when switching to dataset mode
  useEffect(() => {
    if (mode === 'dataset' && dataset.length === 0) {
      loadDataset()
    }
  }, [mode])

  const loadDataset = async () => {
    setLoading(true)
    try {
      const data = await inventoryApi.getDataset()
      setDataset(data)
    } catch {
      toast.error('Failed to load inventory dataset')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!productId) { toast.error('Select a product first'); return }
    setLoading(true)
    setForecast(null)
    try {
      const result = await forecastsApi.generate(productId, parseInt(horizon))
      setForecast(result)
      toast.success('Forecast generated')
    } catch (err) {
      const demo = generateDemoForecast(parseInt(horizon))
      setForecast(demo)
      toast('Demo forecast shown (backend Prophet not ready)', { icon: '⚠️' })
    } finally {
      setLoading(false)
    }
  }

  // Demo forecast fallback when backend isn't ready
  function generateDemoForecast(days) {
    const predictions = Array.from({ length: days }, (_, i) => {
      const base  = 50 + Math.sin(i / 7) * 20 + (i / days) * 30
      const noise = (Math.random() - 0.5) * 10
      const yhat  = Math.max(0, base + noise)
      return {
        ds:          new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
        yhat:        parseFloat(yhat.toFixed(1)),
        yhat_lower:  parseFloat(Math.max(0, yhat - 15).toFixed(1)),
        yhat_upper:  parseFloat((yhat + 15).toFixed(1)),
      }
    })
    return {
      status:        'completed',
      model_name:    'prophet',
      horizon_days:  days,
      forecast_from: predictions[0].ds,
      forecast_to:   predictions[predictions.length - 1].ds,
      mae:  4.82,
      rmse: 6.31,
      mape: 8.7,
      predictions,
    }
  }

  // Downsample chart points for readability
  const chartData = forecast?.predictions
    ?.filter((_, i) => i % 2 === 0)
    ?.map(p => ({
      date:     p.ds,
      forecast: p.yhat,
      lower:    p.yhat_lower,
      upper:    p.yhat_upper,
    })) ?? []

  const selectedProduct = products.find(p => p.id === productId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictive Analytics"
        subtitle="Forecast demand and visualize inventory datasets"
        action={
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner backdrop-blur-2xl">
            <button
              className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all duration-300 flex items-center gap-2 ${
                mode === 'forecast'
                  ? 'bg-amber-500/20 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.15)] border border-amber-500/30 scale-105'
                  : 'text-steel-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setMode('forecast')}
            >
              <Zap size={12} className={mode === 'forecast' ? 'animate-pulse' : ''} /> Demand Forecast
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all duration-300 flex items-center gap-2 ${
                mode === 'dataset'
                  ? 'bg-amber-500/20 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.15)] border border-amber-500/30 scale-105'
                  : 'text-steel-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setMode('dataset')}
            >
              <Database size={12} className={mode === 'dataset' ? 'animate-pulse' : ''} /> Dataset View
            </button>
          </div>
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* FORECAST MODE                                                        */}
      {/* ------------------------------------------------------------------ */}
      {mode === 'forecast' ? (
        <>
          <SectionCard title="Generate Forecast">
            <div className="flex flex-wrap items-end gap-4">
              {/* Search */}
              <div className="flex-1 min-w-48">
                <Field label="Product Search">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-500" size={14} />
                    <input
                      type="text"
                      className="input pl-9"
                      placeholder="Search name or SKU…"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                </Field>
              </div>

              {/* Product select */}
              <div className="flex-1 min-w-48">
                <Field label="Select Product">
                  <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
                    <option value="">
                      {filteredProducts.length > 0 ? 'Select product…' : 'No matches found'}
                    </option>
                    {filteredProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Horizon */}
              <div className="w-36">
                <Field label="Horizon (days)">
                  <select className="input" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                    <option value={365}>365 days</option>
                  </select>
                </Field>
              </div>

              <button
                className="btn-primary flex items-center gap-2 self-end"
                onClick={handleGenerate}
                disabled={loading || !productId}
              >
                {loading ? <Spinner size={14} /> : <Zap size={14} />}
                {loading ? 'Generating…' : 'Run Forecast'}
              </button>
            </div>
          </SectionCard>

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Spinner size={24} />
              <p className="font-mono text-xs text-steel-400 animate-pulse-soft">Processing demand data…</p>
            </div>
          )}

          {forecast && !loading && (
            <div className="space-y-5 animate-slide-up">
              {/* Info bar */}
              <div className="flex items-center gap-3 p-3 card-sm">
                <TrendingUp size={14} className="text-amber-400" />
                <p className="font-mono text-xs text-steel-300">
                  Forecast for <span className="text-amber-400">{selectedProduct?.name}</span>
                  {' '}— {forecast.forecast_from} to {forecast.forecast_to}
                  {' '}({forecast.horizon_days}d · model: {forecast.model_name})
                </p>
              </div>

              {/* Metrics */}
              {(forecast.mae || forecast.rmse || forecast.mape) && (
                <div className="grid grid-cols-3 gap-4">
                  <KpiCard label="MAE"  value={forecast.mae?.toFixed(2)  ?? '—'} sub="Mean Absolute Error"    icon={BarChart2} delay={0}   />
                  <KpiCard label="RMSE" value={forecast.rmse?.toFixed(2) ?? '—'} sub="Root Mean Sq. Error"    icon={BarChart2} delay={50}  />
                  <KpiCard label="MAPE" value={forecast.mape ? `${forecast.mape.toFixed(1)}%` : '—'} sub="Mean Abs. % Error" icon={BarChart2} accent delay={100} />
                </div>
              )}

              {/* Forecast chart */}
              <SectionCard title="Predicted Demand">
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2596be" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2596be" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2533" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.floor(chartData.length / 6)}
                    />
                    <YAxis
                      tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      iconSize={8}
                      wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#94A3B8' }}
                    />
                    {/* Confidence band — upper then lower to sandwich the fill */}
                    <Area dataKey="upper" name="Upper CI" stroke="none" fill="url(#forecastBand)" legendType="none" />
                    <Area dataKey="lower" name="Lower CI" stroke="none" fill="#080A0E"            legendType="none" />
                    {/* Forecast line */}
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="Forecast"
                      stroke="#2596be"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#2596be' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>
          )}

          {!forecast && !loading && (
            <EmptyState
              icon={TrendingUp}
              message="No forecast generated yet"
              sub="Select a product and click Run Forecast"
            />
          )}
        </>

      ) : (
        /* ---------------------------------------------------------------- */
        /* DATASET MODE                                                       */
        /* ---------------------------------------------------------------- */
        <div className="space-y-6 animate-slide-up">
          <SectionCard title="Analyze Inventory Dataset">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-48">
                <Field label="Analytics Mode">
                  <select className="input" value={activeMetric} onChange={(e) => setActiveMetric(e.target.value)}>
                    <option value="current_stock">Stock vs Reorder Point</option>
                    <option value="selling_price">Price Distribution</option>
                  </select>
                </Field>
              </div>
              <button className="btn-ghost flex items-center gap-2 py-2" onClick={loadDataset}>
                <Layers size={13} /> Refresh Data
              </button>
            </div>
          </SectionCard>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner size={24} />
              <p className="font-mono text-xs text-steel-400">Loading inventory dataset…</p>
            </div>
          ) : dataset.length > 0 ? (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <KpiCard
                  label="Items"
                  value={dataset.length}
                  sub="Products in database"
                  icon={Database}
                  delay={0}
                />
                <KpiCard
                  label="Avg Stock"
                  value={(dataset.reduce((a, b) => a + (b.current_stock ?? 0), 0) / dataset.length).toFixed(1)}
                  sub="Units per product"
                  icon={Layers}
                  delay={50}
                />
                <KpiCard
                  label="Avg Price"
                  value={`₹${(dataset.reduce((a, b) => a + (b.selling_price ?? 0), 0) / dataset.length).toFixed(2)}`}
                  sub="Selling price avg"
                  icon={BarChart2}
                  accent
                  delay={100}
                />
              </div>

              {/* Chart */}
              <SectionCard title={activeMetric === 'current_stock' ? 'Stock Level vs Reorder Point' : 'Selling Price Distribution'}>
                <div className="h-[400px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dataset.slice(0, 15)}
                      margin={{ top: 10, right: 10, bottom: 60, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f87171" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2533" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontFamily: 'JetBrains Mono', fontSize: 8, fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
                      />

                      {activeMetric === 'current_stock' ? (
                        <>
                          <Area
                            type="monotone"
                            dataKey="current_stock"
                            name="Stock Level"
                            stroke="#fbbf24"
                            strokeWidth={2}
                            fill="url(#amberGrad)"
                            dot={{ r: 2, fill: '#fbbf24' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="reorder_point"
                            name="Reorder Point"
                            stroke="#f87171"
                            strokeWidth={2}
                            fill="url(#redGrad)"
                            strokeDasharray="5 5"
                          />
                        </>
                      ) : (
                        <Area
                          type="monotone"
                          dataKey="selling_price"
                          name="Selling Price"
                          stroke="#22d3ee"
                          strokeWidth={2}
                          fill="url(#cyanGrad)"
                          dot={{ r: 2, fill: '#22d3ee' }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-steel-500 font-mono text-center mt-6 uppercase tracking-wider">
                  Showing top 15 products · click a row below to drill into weekly sales
                </p>
              </SectionCard>

              {/* Dataset table — click row → open sales modal */}
              <SectionCard title="Dataset Detail">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="text-left px-4 pb-2">SKU</th>
                        <th className="text-left px-4 pb-2">Name</th>
                        <th className="text-left px-4 pb-2">Category</th>
                        <th className="text-right px-4 pb-2">Price</th>
                        <th className="text-right px-4 pb-2">Stock</th>
                        <th className="text-right px-4 pb-2">Reorder At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.slice(0, showAllRows ? dataset.length : 10).map((item, i) => (
                        <tr
                          key={i}
                          className="table-row cursor-pointer hover:bg-white/5 group transition-all"
                          onClick={() => {
                            // item must have: sku, name, category
                            setSelectedProductForModal(item)
                            setIsModalOpen(true)
                          }}
                        >
                          <td className="table-cell text-amber-400 font-bold flex items-center gap-2">
                            {item.sku}
                            <LineChart
                              size={10}
                              className="text-steel-600 group-hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100"
                            />
                          </td>
                          <td className="table-cell text-white font-display font-semibold text-xs truncate max-w-[150px] group-hover:text-amber-200 transition-colors">
                            {item.name}
                          </td>
                          <td className="table-cell text-steel-400">{item.category}</td>
                          <td className="table-cell text-right text-green-400">
                            ₹{item.selling_price?.toFixed(2) ?? '—'}
                          </td>
                          <td className="table-cell text-right font-mono">{item.current_stock}</td>
                          <td className="table-cell text-right font-mono text-red-400">{item.reorder_point}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!showAllRows && dataset.length > 10 && (
                    <button
                      onClick={() => setShowAllRows(true)}
                      className="w-full text-[10px] text-steel hover:text-white font-mono text-center py-4 bg-white/5 hover:bg-white/10 transition-all border-t border-white/5 uppercase tracking-widest"
                    >
                      + {dataset.length - 10} more rows… (Click to reveal all)
                    </button>
                  )}
                  {showAllRows && dataset.length > 10 && (
                    <button
                      onClick={() => setShowAllRows(false)}
                      className="w-full text-[10px] text-steel hover:text-white font-mono text-center py-4 bg-white/5 hover:bg-white/10 transition-all border-t border-white/5 uppercase tracking-widest"
                    >
                      Collapse list
                    </button>
                  )}
                </div>
              </SectionCard>
            </div>
          ) : (
            <EmptyState icon={Database} message="No dataset loaded" sub="Click Refresh Data to load products" />
          )}
        </div>
      )}

      {/* Sales history drill-down modal */}
      <ProductSalesModal
        product={selectedProductForModal}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProductForModal(null) }}
      />
    </div>
  )
}