/**
 * Forecast page — select a product, trigger forecast, display predictions + metrics.
 */
import { useState, useEffect } from 'react'
import { TrendingUp, Zap, BarChart2, Database, Layers, X, LineChart, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar, AreaChart, Brush
} from 'recharts'
import { productsApi, forecastsApi, inventoryApi } from '../api/services'
import { PageHeader, SectionCard, Spinner, EmptyState, Field, KpiCard } from '../components/ui'
import toast from 'react-hot-toast'

const ProductSalesModal = ({ product, isOpen, onClose }) => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState({ startIndex: 0, endIndex: 11 })

  useEffect(() => {
    if (isOpen && product) {
      setLoading(true)
      inventoryApi.getProductSales(product.sku)
        .then(data => {
          setSales(data)
          if (data.length > 0) {
            setRange({ startIndex: 0, endIndex: Math.min(11, data.length - 1) })
          }
        })
        .catch(() => toast.error('Failed to load sales history'))
        .finally(() => setLoading(false))
    } else {
      setSales([])
    }
  }, [isOpen, product])

  const handleScroll = (dir) => {
    const shift = 4
    const len = sales.length
    if (len ===0) return
    
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

  const peakValue = sales.length > 0 ? Math.max(...sales.map(s => s.sales)) : 0
  const totalSalesValue = sales.reduce((acc, curr) => acc + curr.sales, 0)
  const avgSalesValue = sales.length > 0 ? (totalSalesValue / sales.length).toFixed(1) : '0'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-ink-900 border border-ink-600 rounded-xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-600 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-white leading-tight">{product?.name}</h3>
            <p className="text-[10px] font-mono text-steel-400 uppercase tracking-widest">{product?.sku} • {product?.category}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-ink-800 rounded-lg text-steel-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="h-[450px] flex flex-col items-center justify-center gap-3">
              <Spinner size={32} />
              <p className="font-mono text-xs text-steel-400">Loading 2025 Weekly Data...</p>
            </div>
          ) : sales.length > 0 ? (
            <div className="space-y-6">
              <div 
                className="h-[400px] w-full relative group"
                onWheel={handleWheel}
              >
                {/* Navigation Buttons Overlay */}
                <div className="absolute inset-y-0 left-0 flex items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleScroll('left')}
                    className="p-2 ml-2 bg-ink-800/80 border border-ink-600 rounded-full text-white hover:bg-amber-400 hover:text-ink-900 transition-all shadow-xl"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleScroll('right')}
                    className="p-2 mr-2 bg-ink-800/80 border border-ink-600 rounded-full text-white hover:bg-amber-400 hover:text-ink-900 transition-all shadow-xl"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sales} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2533" vertical={false} />
                    <XAxis 
                       dataKey="week" 
                       tick={{fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#94A3B8'}}
                       axisLine={false}
                       tickLine={false}
                       interval={0}
                    />
                    <YAxis 
                       tick={{fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8'}}
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
              <div className="grid grid-cols-4 gap-4">
                <KpiCard label="Peak Week" value={peakValue} sub="Highest units sold" icon={TrendingUp} delay={0} />
                <KpiCard label="Average" value={avgSalesValue} sub="Units per week" icon={Layers} delay={50} />
                <KpiCard label="Total Sales" value={totalSalesValue} sub="Total units sold" icon={Database} accent delay={100} />
                <KpiCard label="Period" value={sales.length} sub="Weeks (2025)" icon={BarChart2} delay={150} />
              </div>
            </div>
          ) : (
            <div className="py-20">
              <EmptyState icon={BarChart2} message="No sales historical data found" sub={`No rows found for SKU ${product?.sku} in sales_data_weekly.csv`} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-md px-3 py-2 shadow-xl">
      <p className="font-mono text-[10px] text-steel-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function Forecast() {
  const [products, setProducts]   = useState([])
  const [productId, setProductId] = useState('')
  const [horizon, setHorizon]     = useState(90)
  const [loading, setLoading]     = useState(false)
  const [forecast, setForecast]   = useState(null)

  // Dataset logic
  const [mode, setMode]           = useState('forecast') // 'forecast' or 'dataset'
  const [dataset, setDataset]     = useState([])
  const [activeMetric, setActiveMetric] = useState('current_stock')

  // Drill-down logic
  const [selectedProductForModal, setSelectedProductForModal] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    productsApi.list({ page_size: 100 })
      .then((d) => setProducts(d.items ?? []))
      .catch(() => {})
  }, [])

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
    } finally { setLoading(false) }
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
      // If backend phases 2+3 not built yet, show demo forecast
      const demo = generateDemoForecast(parseInt(horizon))
      setForecast(demo)
      toast('Demo forecast shown (backend phase 3 pending)', { icon: '⚠️' })
    } finally { setLoading(false) }
  }

  // Demo forecast data when backend isn't ready
  function generateDemoForecast(days) {
    const predictions = Array.from({ length: days }, (_, i) => {
      const base = 50 + Math.sin(i / 7) * 20 + (i / days) * 30
      const noise = (Math.random() - 0.5) * 10
      const yhat = Math.max(0, base + noise)
      return {
        ds: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
        yhat: parseFloat(yhat.toFixed(1)),
        yhat_lower: parseFloat(Math.max(0, yhat - 15).toFixed(1)),
        yhat_upper: parseFloat((yhat + 15).toFixed(1)),
      }
    })
    return {
      status: 'completed',
      model_name: 'prophet',
      horizon_days: days,
      forecast_from: predictions[0].ds,
      forecast_to: predictions[predictions.length - 1].ds,
      mae: 4.82,
      rmse: 6.31,
      mape: 8.7,
      predictions,
    }
  }

  // Build chart data — only show every 3rd point for readability
  const chartData = forecast?.predictions
    ?.filter((_, i) => i % 2 === 0)
    ?.map((p) => ({
      date: p.ds,
      forecast: p.yhat,
      lower: p.yhat_lower,
      upper: p.yhat_upper,
    })) ?? []

  const selectedProduct = products.find(p => p.id === productId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictive Analytics"
        subtitle="Forecast demand and visualize inventory datasets"
        action={
          <div className="flex bg-ink-800 p-1 rounded-lg border border-ink-600">
            <button
              className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-2 ${mode === 'forecast' ? 'bg-amber-400 text-ink-900 shadow-lg' : 'text-steel-400 hover:text-white'}`}
              onClick={() => setMode('forecast')}
            >
              <Zap size={12} /> Demand Forecast
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-2 ${mode === 'dataset' ? 'bg-amber-400 text-ink-900 shadow-lg' : 'text-steel-400 hover:text-white'}`}
              onClick={() => setMode('dataset')}
            >
              <Database size={12} /> Dataset View
            </button>
          </div>
        }
      />

      {mode === 'forecast' ? (
        <>
          {/* Controls */}
          <SectionCard title="Generate Forecast">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-48">
                <Field label="Product">
                  <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </Field>
              </div>
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

          {/* Results */}
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
                  {' '}({forecast.horizon_days}d, model: {forecast.model_name})
                </p>
              </div>

              {/* Metrics */}
              {(forecast.mae || forecast.rmse || forecast.mape) && (
                <div className="grid grid-cols-3 gap-4">
                  <KpiCard label="MAE" value={forecast.mae?.toFixed(2) ?? '—'} sub="Mean Absolute Error" icon={BarChart2} delay={0} />
                  <KpiCard label="RMSE" value={forecast.rmse?.toFixed(2) ?? '—'} sub="Root Mean Sq. Error" icon={BarChart2} delay={50} />
                  <KpiCard label="MAPE" value={forecast.mape ? `${forecast.mape.toFixed(1)}%` : '—'} sub="Mean Abs. % Error" icon={BarChart2} accent delay={100} />
                </div>
              )}

              {/* Forecast Chart */}
              <SectionCard title="Predicted Demand">
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="2596be" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="2596be" stopOpacity={0.02} />
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
                    <Legend iconSize={8} wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#94A3B8' }} />
                    <Area dataKey="upper" name="Upper CI" stroke="none" fill="url(#forecastBand)" legendType="none" />
                    <Area dataKey="lower" name="Lower CI" stroke="none" fill="#080A0E" legendType="none" />
                    <Line type="monotone" dataKey="forecast" name="Forecast" stroke="2596be" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '2596be' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>
          )}

          {!forecast && !loading && (
            <EmptyState icon={TrendingUp} message="No forecast generated yet" sub="Select a product and click Run Forecast" />
          )}
        </>
      ) : (
        <div className="space-y-6 animate-slide-up">
          <SectionCard title="Analyze Inventory Dataset">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-48">
                <Field label="Analytics Mode">
                  <select className="input" value={activeMetric} onChange={(e) => setActiveMetric(e.target.value)}>
                    <option value="current_stock">Stock vs Reorder Point</option>
                    <option value="selling_price">Price vs Market Trend</option>
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
              <p className="font-mono text-xs text-steel-400">Parsing inventory.csv dataset…</p>
            </div>
          ) : dataset.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <KpiCard label="Items" value={dataset.length} sub="Rows in dataset" icon={Database} delay={0} />
                <KpiCard 
                  label="Avg Stock" 
                  value={dataset.length > 0 ? (dataset.reduce((a, b) => a + b.current_stock, 0) / dataset.length).toFixed(1) : '0'} 
                  sub="Across products" icon={Layers} delay={50} 
                />
                <KpiCard 
                  label="Avg Price" 
                  value={dataset.length > 0 ? `₹${(dataset.reduce((a, b) => a + b.selling_price, 0) / dataset.length).toFixed(2)}` : '₹0.00'} 
                  sub="Per unit" icon={BarChart2} accent delay={100} 
                />
              </div>

              <SectionCard title={activeMetric === 'current_stock' ? 'Stock Level vs Reorder Point' : 'Price vs Market Comparison'}>
                <div className="h-[400px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataset.slice(0, 15)} margin={{ top: 10, right: 10, bottom: 60, left: 0 }}>
                      <defs>
                        <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
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
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} />
                      
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
                        <>
                          <Area
                            type="monotone"
                            dataKey="selling_price"
                            name="Selling Price"
                            stroke="#22d3ee"
                            strokeWidth={2}
                            fill="url(#cyanGrad)"
                            dot={{ r: 2, fill: '#22d3ee' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="market_price"
                            name="Market Price"
                            stroke="#a855f7"
                            strokeWidth={2}
                            fill="#a855f7"
                            fillOpacity={0.1}
                          />
                        </>
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-steel-500 font-mono text-center mt-6 uppercase tracking-wider">
                  Showing top 15 products from CSV
                </p>
              </SectionCard>

              <SectionCard title="Dataset Detail">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="text-left px-4 pb-2">SKU</th>
                        <th className="text-left px-4 pb-2">Name</th>
                        <th className="text-left px-4 pb-2">Category</th>
                        <th className="text-right px-4 pb-2">Price</th>
                        <th className="text-right px-4 pb-2">Market Price</th>
                        <th className="text-right px-4 pb-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.slice(0, 10).map((item, i) => (
                        <tr 
                          key={i} 
                          className="table-row cursor-pointer hover:bg-ink-800/50 group transition-all"
                          onClick={() => {
                            setSelectedProductForModal(item)
                            setIsModalOpen(true)
                          }}
                        >
                          <td className="table-cell text-amber-400 font-bold flex items-center gap-2">
                            {item.sku}
                            <LineChart size={10} className="text-steel-600 group-hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100" />
                          </td>
                          <td className="table-cell text-white font-display font-semibold text-xs truncate max-w-[150px] group-hover:text-amber-200 transition-colors">
                            {item.name}
                          </td>
                          <td className="table-cell text-steel-400">{item.category}</td>
                          <td className="table-cell text-right text-green-400">₹{item.selling_price.toFixed(2)}</td>
                          <td className="table-cell text-right text-purple-400">₹{item.market_price?.toFixed(2)}</td>
                          <td className="table-cell text-right font-mono">{item.current_stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dataset.length > 10 && (
                    <p className="text-[10px] text-steel-500 font-mono text-center py-3">
                      + {dataset.length - 10} more rows…
                    </p>
                  )}
                </div>
              </SectionCard>
            </div>
          ) : (
            <EmptyState icon={Database} message="No dataset loaded" sub="Wait while we fetch inventory.csv" />
          )}
        </div>
      )}

      <ProductSalesModal 
        product={selectedProductForModal} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
