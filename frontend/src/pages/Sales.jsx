/**
 * Sales page — manual sale entry + CSV bulk upload + sales history table.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Upload, ShoppingCart, CheckCircle, X } from 'lucide-react'
import { salesApi, productsApi } from '../api/services'
import {
  PageHeader, SectionCard, Modal, Spinner, EmptyState, Field, Pagination,
} from '../components/ui'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  product_id: '', quantity: 1, unit_price: '', sale_date: format(new Date(), 'yyyy-MM-dd'),
  reference_number: '', notes: '',
}

export default function Sales() {
  const [sales, setSales]       = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [loading, setLoading]   = useState(true)
  const [products, setProducts] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const [csvModal, setCsvModal]     = useState(false)
  const [csvFile, setCsvFile]       = useState(null)
  const [csvUploading, setCsvUploading] = useState(false)
  const [csvResult, setCsvResult]   = useState(null)
  const fileRef = useRef()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await salesApi.list({ page, page_size: 15 })
      setSales(data.items ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
    } catch {
      // Sales endpoint may not exist yet — show empty
      setSales([])
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    productsApi.list({ page_size: 200 })
      .then((d) => setProducts(d.items ?? []))
      .catch(() => {})
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await salesApi.create({
        ...form,
        quantity: parseInt(form.quantity),
        unit_price: parseFloat(form.unit_price),
      })
      toast.success('Sale recorded')
      setModalOpen(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to record sale')
    } finally { setSaving(false) }
  }

  const handleCsvUpload = async () => {
    if (!csvFile) return
    setCsvUploading(true)
    try {
      const result = await salesApi.uploadCsv(csvFile)
      setCsvResult(result)
      toast.success(`Imported ${result.imported ?? 0} records`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'CSV upload failed')
    } finally { setCsvUploading(false) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        subtitle={`${total} transactions recorded`}
        action={
          <div className="flex gap-3">
            <button className="btn-ghost flex items-center gap-2" onClick={() => { setCsvResult(null); setCsvFile(null); setCsvModal(true) }}>
              <Upload size={13} /> Import CSV
            </button>
            <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
              <Plus size={14} /> Record Sale
            </button>
          </div>
        }
      />

      {/* CSV format hint */}
      <div className="card-sm p-4 border-dashed border-amber-400/20 bg-amber-400/3">
        <p className="font-mono text-[10px] text-steel-400 uppercase tracking-widest mb-1">CSV Format</p>
        <p className="font-mono text-xs text-amber-400/70">
          product_sku, quantity, unit_price, sale_date (YYYY-MM-DD)
        </p>
      </div>

      {/* Sales Table */}
      <SectionCard title="Transaction History">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={20} /></div>
        ) : sales.length === 0 ? (
          <EmptyState icon={ShoppingCart} message="No sales recorded yet" sub="Record a sale or import via CSV" />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 pb-2">Date</th>
                  <th className="text-left px-4 pb-2">Product</th>
                  <th className="text-right px-4 pb-2">Qty</th>
                  <th className="text-right px-4 pb-2">Unit Price</th>
                  <th className="text-right px-4 pb-2">Total</th>
                  <th className="text-center px-4 pb-2">Source</th>
                  <th className="text-left px-4 pb-2">Ref</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="table-cell">{s.sale_date}</td>
                    <td className="table-cell text-white font-display font-semibold text-xs">{s.product_name ?? s.product_id?.slice(0, 8)}</td>
                    <td className="table-cell text-right text-amber-400">{s.quantity}</td>
                    <td className="table-cell text-right">₹{parseFloat(s.unit_price).toFixed(2)}</td>
                    <td className="table-cell text-right text-green-400">₹{parseFloat(s.total_amount).toFixed(2)}</td>
                    <td className="table-cell text-center">
                      <span className={s.source === 'csv_import' ? 'badge-neutral' : 'badge-success'}>
                        {s.source}
                      </span>
                    </td>
                    <td className="table-cell text-steel-400">{s.reference_number ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} onChange={setPage} />
          </>
        )}
      </SectionCard>

      {/* Record Sale Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Sale">
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Product *">
            <select className="input" value={form.product_id} onChange={f('product_id')} required>
              <option value="">Select product…</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku}) — Stock: {p.current_stock}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity *">
              <input className="input" type="number" min="1" value={form.quantity} onChange={f('quantity')} required />
            </Field>
            <Field label="Unit Price *">
              <input className="input" type="number" step="0.01" value={form.unit_price} onChange={f('unit_price')} required />
            </Field>
          </div>
          <Field label="Sale Date *">
            <input className="input" type="date" value={form.sale_date} onChange={f('sale_date')} required />
          </Field>
          <Field label="Reference Number">
            <input className="input" value={form.reference_number} onChange={f('reference_number')} placeholder="INV-001" />
          </Field>
          <Field label="Notes">
            <textarea className="input h-16 resize-none" value={form.notes} onChange={f('notes')} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size={14} /> : 'Record Sale'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Upload Modal */}
      <Modal open={csvModal} onClose={() => setCsvModal(false)} title="Import Sales CSV" width="max-w-md">
        {csvResult ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-md">
              <CheckCircle size={20} className="text-green-400 shrink-0" />
              <div>
                <p className="font-mono text-sm text-green-400 font-bold">Import successful</p>
                <p className="font-mono text-xs text-steel-400 mt-1">
                  {csvResult.imported} records imported
                  {csvResult.skipped > 0 && `, ${csvResult.skipped} skipped`}
                  {csvResult.errors?.length > 0 && `, ${csvResult.errors.length} errors`}
                </p>
              </div>
            </div>
            {csvResult.errors?.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {csvResult.errors.map((e, i) => (
                  <p key={i} className="font-mono text-xs text-red-400">Row {e.row}: {e.message}</p>
                ))}
              </div>
            )}
            <button className="btn-primary w-full" onClick={() => setCsvModal(false)}>Done</button>
          </div>
        ) : (
          <div className="space-y-5">
            <div
              className="border-2 border-dashed border-ink-600 hover:border-amber-400/50 rounded-lg p-8
                         flex flex-col items-center gap-3 cursor-pointer transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={24} className="text-steel-400" />
              {csvFile ? (
                <div className="text-center">
                  <p className="font-mono text-sm text-amber-400">{csvFile.name}</p>
                  <p className="font-mono text-xs text-steel-400">{(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <>
                  <p className="font-mono text-sm text-steel-300">Click to select CSV file</p>
                  <p className="font-mono text-xs text-steel-400">Max 10 MB</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setCsvFile(e.target.files[0])}
              />
            </div>

            <div className="card-sm p-3">
              <p className="font-mono text-[10px] text-steel-400 uppercase tracking-widest mb-2">Required columns</p>
              <code className="font-mono text-xs text-amber-400">
                product_sku, quantity, unit_price, sale_date
              </code>
            </div>

            <div className="flex justify-end gap-3">
              <button className="btn-ghost" onClick={() => setCsvModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleCsvUpload}
                disabled={!csvFile || csvUploading}
              >
                {csvUploading ? <Spinner size={14} /> : 'Upload & Import'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
