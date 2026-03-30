/**
 * Suppliers page — full CRUD.
 */
import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Truck, Mail, Phone } from 'lucide-react'
import { suppliersApi } from '../api/services'
import {
  PageHeader, SectionCard, Modal, ConfirmDialog,
  Spinner, EmptyState, Field, Pagination,
} from '../components/ui'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', contact_name: '', email: '',
  phone: '', address: '', notes: '',
}

export default function Suppliers() {
  const [items, setItems]       = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [loading, setLoading]   = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [deleteId, setDeleteId]   = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await suppliersApi.list({ page, page_size: 20 })
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
    } catch { toast.error('Failed to load suppliers') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (s) => {
    setEditItem(s)
    setForm({
      name: s.name, contact_name: s.contact_name ?? '',
      email: s.email ?? '', phone: s.phone ?? '',
      address: s.address ?? '', notes: s.notes ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v || null])
      )
      if (editItem) { await suppliersApi.update(editItem.id, payload); toast.success('Supplier updated') }
      else          { await suppliersApi.create(payload); toast.success('Supplier created') }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await suppliersApi.delete(deleteId)
      toast.success('Supplier removed')
      setDeleteId(null)
      load()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle={`${total} suppliers`}
        action={
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={14} /> New Supplier
          </button>
        }
      />

      <SectionCard>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={20} /></div>
        ) : items.length === 0 ? (
          <EmptyState icon={Truck} message="No suppliers yet" sub="Add your first supplier" />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 pb-2">Company</th>
                  <th className="text-left px-4 pb-2">Contact</th>
                  <th className="text-left px-4 pb-2">Email</th>
                  <th className="text-left px-4 pb-2">Phone</th>
                  <th className="text-center px-4 pb-2">Status</th>
                  <th className="text-right px-4 pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="table-row">
                    <td className="table-cell text-white font-display font-bold text-xs">{s.name}</td>
                    <td className="table-cell text-steel-300">{s.contact_name ?? '—'}</td>
                    <td className="table-cell">
                      {s.email
                        ? <a href={`mailto:${s.email}`} className="text-amber-400 hover:underline flex items-center gap-1">
                            <Mail size={11} />{s.email}
                          </a>
                        : <span className="text-steel-400">—</span>
                      }
                    </td>
                    <td className="table-cell text-steel-300">
                      {s.phone
                        ? <span className="flex items-center gap-1"><Phone size={11} />{s.phone}</span>
                        : '—'}
                    </td>
                    <td className="table-cell text-center">
                      {s.is_active
                        ? <span className="badge-success">Active</span>
                        : <span className="badge-neutral">Inactive</span>}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-steel-400 hover:text-amber-400 transition-colors" onClick={() => openEdit(s)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="text-steel-400 hover:text-red-400 transition-colors" onClick={() => setDeleteId(s.id)}>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Supplier' : 'New Supplier'} width="max-w-lg">
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Company Name *">
            <input className="input" value={form.name} onChange={f('name')} required autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Person">
              <input className="input" value={form.contact_name} onChange={f('contact_name')} />
            </Field>
            <Field label="Email">
              <input className="input" type="email" value={form.email} onChange={f('email')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <input className="input" value={form.phone} onChange={f('phone')} />
            </Field>
            <Field label="Address">
              <input className="input" value={form.address} onChange={f('address')} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea className="input h-20 resize-none" value={form.notes} onChange={f('notes')} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner size={14} /> : (editItem ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Supplier"
        message="This will deactivate the supplier. Associated products will be unaffected."
      />
    </div>
  )
}
