/**
 * Alerts page — all products at or below reorder point, sortable.
 */
import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowUpDown } from 'lucide-react'
import { productsApi } from '../api/services'
import { PageHeader, SectionCard, Spinner, EmptyState, StockBadge } from '../components/ui'
import toast from 'react-hot-toast'

export default function Alerts() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort]       = useState('stock_asc')

  const load = async () => {
    setLoading(true)
    try {
      const data = await productsApi.lowStock()
      setItems(data)
    } catch { toast.error('Failed to load alerts') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const sorted = [...items].sort((a, b) => {
    switch (sort) {
      case 'stock_asc':  return a.current_stock - b.current_stock
      case 'stock_desc': return b.current_stock - a.current_stock
      case 'name':       return a.name.localeCompare(b.name)
      default:           return 0
    }
  })

  const outOfStock = items.filter(i => i.current_stock === 0).length
  const critical   = items.filter(i => i.current_stock > 0 && i.current_stock <= 5).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Alerts"
        subtitle={`${items.length} products need attention`}
        action={
          <button className="btn-ghost flex items-center gap-2" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap animate-fade-in">
        <div className="card-sm px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          <span className="font-mono text-xs text-steel-300">
            Out of stock: <span className="text-red-400 font-bold">{outOfStock}</span>
          </span>
        </div>
        <div className="card-sm px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="font-mono text-xs text-steel-300">
            Critical (≤5 units): <span className="text-amber-400 font-bold">{critical}</span>
          </span>
        </div>
        <div className="card-sm px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-steel-400"></span>
          <span className="font-mono text-xs text-steel-300">
            Low stock: <span className="text-steel-200 font-bold">{items.length - outOfStock - critical}</span>
          </span>
        </div>
      </div>

      <SectionCard
        title="Items Requiring Reorder"
        action={
          <div className="flex items-center gap-2">
            <ArrowUpDown size={12} className="text-steel-400" />
            <select
              className="bg-transparent font-mono text-xs text-steel-400 focus:outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="stock_asc">Stock ↑</option>
              <option value="stock_desc">Stock ↓</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={20} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            message="All products are adequately stocked"
            sub="No items are currently at or below their reorder point"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 pb-2">Product</th>
                <th className="text-left px-4 pb-2">SKU</th>
                <th className="text-right px-4 pb-2">Current Stock</th>
                <th className="text-right px-4 pb-2">Reorder Point</th>
                <th className="text-right px-4 pb-2">Deficit</th>
                <th className="text-center px-4 pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const reorder = p.reorder_point ?? 10
                const deficit = reorder - p.current_stock
                return (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell text-white font-display font-semibold text-xs">{p.name}</td>
                    <td className="table-cell text-amber-400">{p.sku}</td>
                    <td className="table-cell text-right">
                      <span className={p.current_stock === 0 ? 'text-red-400 font-bold' : p.current_stock <= 5 ? 'text-amber-400 font-bold' : 'text-steel-300'}>
                        {p.current_stock}
                      </span>
                    </td>
                    <td className="table-cell text-right text-steel-400">{reorder}</td>
                    <td className="table-cell text-right text-red-400">−{deficit}</td>
                    <td className="table-cell text-center">
                      <StockBadge stock={p.current_stock} reorderPoint={reorder} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  )
}
