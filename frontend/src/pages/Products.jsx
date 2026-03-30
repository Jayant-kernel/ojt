/**
 * Products page — searchable table with create/edit/delete modals
 * and inline stock adjustment.
 */
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, RefreshCw, X } from 'lucide-react'
import { productsApi, categoriesApi, suppliersApi } from '../api/services'
import {
  PageHeader, SectionCard, Modal, ConfirmDialog,
  Spinner, EmptyState, StockBadge, Pagination, Field,
} from '../components/ui'
import toast from 'react-hot-toast'
import { Package } from 'lucide-react'

const EMPTY_FORM = {
  sku: '', name: '', description: '', cost_price: '', selling_price: '',
  current_stock: 0, reorder_point: 10, reorder_quantity: 50, max_stock: 500,
  category_id: '', supplier_id: '',
}

export default function Products() {
  const [products, setProducts]     = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [pages, setPages]           = useState(1)
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers]   = useState([])

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  // Confirm delete
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)

  // Stock adjust
  const [stockItem, setStockItem]   = useState(null)
  const [adjustment, setAdjustment] = useState(0)
  const [adjusting, setAdjusting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await productsApi.list({ page, page_size: 15, search: search || undefined })
      setProducts(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    Promise.all([
      categoriesApi.list({ page_size: 100 }),
      suppliersApi.list({ page_size: 100 }),
    ]).then(([c, s]) => {
      setCategories(c.items || [])
      setSuppliers(s.items || [])
    })
  }, [])

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit   = (p) => {
    setEditItem(p)
    setForm({
      sku: p.sku, name: p.name, description: p.description ?? '',
      cost_price: p.cost_price, selling_price: p.selling_price,
      current_stock: p.current_stock, reorder_point: p.reorder_point,
      reorder_quantity: p.reorder_quantity, max_stock: p.max_stock,
      category_id: p.category_id ?? '', supplier_id: p.supplier_id ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        cost_price: parseFloat(form.cost_price),
        selling_price: parseFloat(form.selling_price),
        current_stock: parseInt(form.current_stock),
        reorder_point: parseInt(form.reorder_point),
        reorder_quantity: parseInt(form.reorder_quantity),
        max_stock: parseInt(form.max_stock),
        category_id: form.category_id || null,
        supplier_id: form.supplier_id || null,
      }
      if (editItem) { await productsApi.update(editItem.id, payload); toast.success('Product updated') }
      else          { await productsApi.create(payload); toast.success('Product created') }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productsApi.delete(deleteId)
      toast.success('Product removed')
      setDeleteId(null)
      load()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const handleAdjust = async () => {
    setAdjusting(true)
    try {
      await productsApi.adjustStock(stockItem.id, parseInt(adjustment))
      toast.success(`Stock adjusted by ${adjustment > 0 ? '+' : ''}${adjustment}`)
      setStockItem(null)
      load()
    } catch (err) { toast.error(err.response?.data?.detail ?? 'Adjustment failed') }
    finally { setAdjusting(false) }
  }

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${total} products in inventory`}
        action={
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={14} /> New Product
          </button>
        }
      />

      <SectionCard>
        {/* Search bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
            <input
              className="input pl-8"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button className="btn-ghost flex items-center gap-2 py-2" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={20} /></div>
        ) : products.length === 0 ? (
          <EmptyState icon={Package} message="No products found" sub="Create your first product to get started" />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 pb-2">SKU</th>
                  <th className="text-left px-4 pb-2">Name</th>
                  <th className="text-left px-4 pb-2">Category</th>
                  <th className="text-right px-4 pb-2">Cost</th>
                  <th className="text-right px-4 pb-2">Price</th>
                  <th className="text-right px-4 pb-2">Stock</th>
                  <th className="text-center px-4 pb-2">Status</th>
                  <th className="text-right px-4 pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell text-amber-400 font-bold">{p.sku}</td>
                    <td className="table-cell text-white font-display font-semibold text-xs max-w-[160px] truncate">{p.name}</td>
                    <td className="table-cell text-steel-400">{p.category?.name ?? '—'}</td>
                    <td className="table-cell text-right">₹{parseFloat(p.cost_price).toFixed(2)}</td>
                    <td className="table-cell text-right text-green-400">₹{parseFloat(p.selling_price).toFixed(2)}</td>
                    <td className="table-cell text-right">
                      <button
                        className="hover:text-amber-400 transition-colors"
                        onClick={() => { setStockItem(p); setAdjustment(0) }}
                      >
                        {p.current_stock}
                      </button>
                    </td>
                    <td className="table-cell text-center">
                      <StockBadge stock={p.current_stock} reorderPoint={p.reorder_point} />
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-steel-400 hover:text-amber-400 transition-colors"
                          onClick={() => openEdit(p)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="text-steel-400 hover:text-red-400 transition-colors"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} onChange={setPage} />
          </>
        )}
      </SectionCard>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Product' : 'New Product'} width="max-w-2xl">
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <Field label="SKU *">
            <input className="input" value={form.sku} onChange={f('sku')} required disabled={!!editItem} />
          </Field>
          <Field label="Name *">
            <input className="input" value={form.name} onChange={f('name')} required />
          </Field>
          <Field label="Cost Price *">
            <input className="input" type="number" step="0.01" value={form.cost_price} onChange={f('cost_price')} required />
          </Field>
          <Field label="Selling Price *">
            <input className="input" type="number" step="0.01" value={form.selling_price} onChange={f('selling_price')} required />
          </Field>
          <Field label="Category">
            <select className="input" value={form.category_id} onChange={f('category_id')}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Supplier">
            <select className="input" value={form.supplier_id} onChange={f('supplier_id')}>
              <option value="">— None —</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Current Stock">
            <input className="input" type="number" value={form.current_stock} onChange={f('current_stock')} />
          </Field>
          <Field label="Reorder Point">
            <input className="input" type="number" value={form.reorder_point} onChange={f('reorder_point')} />
          </Field>
          <Field label="Reorder Qty">
            <input className="input" type="number" value={form.reorder_quantity} onChange={f('reorder_quantity')} />
          </Field>
          <Field label="Max Stock">
            <input className="input" type="number" value={form.max_stock} onChange={f('max_stock')} />
          </Field>
          <div className="col-span-2">
            <Field label="Description">
              <textarea className="input h-20 resize-none" value={form.description} onChange={f('description')} />
            </Field>
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size={14} /> : (editItem ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjust Modal */}
      <Modal open={!!stockItem} onClose={() => setStockItem(null)} title="Adjust Stock" width="max-w-sm">
        {stockItem && (
          <div className="space-y-4">
            <div className="card-sm p-3 flex justify-between items-center">
              <div>
                <p className="font-mono text-xs text-steel-400">{stockItem.sku}</p>
                <p className="font-display font-bold text-sm text-white">{stockItem.name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-steel-400">Current</p>
                <p className="font-mono text-xl font-bold text-amber-400">{stockItem.current_stock}</p>
              </div>
            </div>
            <Field label="Adjustment (+ add / − remove)">
              <input
                className="input"
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                placeholder="e.g. 50 or -10"
              />
            </Field>
            <div className="flex justify-end gap-3">
              <button className="btn-ghost" onClick={() => setStockItem(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdjust} disabled={adjusting || adjustment === 0 || adjustment === '0'}>
                {adjusting ? <Spinner size={14} /> : 'Apply'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Product"
        message="This will deactivate the product. It won't be deleted from the database."
      />
    </div>
  )
}
