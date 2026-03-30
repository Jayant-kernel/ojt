/**
 * Categories page — full CRUD with inline table editing.
 */
import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Tags } from 'lucide-react'
import { categoriesApi } from '../api/services'
import {
  PageHeader, SectionCard, Modal, ConfirmDialog,
  Spinner, EmptyState, Field, Pagination,
} from '../components/ui'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', description: '' }

export default function Categories() {
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
      const data = await categoriesApi.list({ page, page_size: 20 })
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
    } catch { toast.error('Failed to load categories') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit   = (c) => { setEditItem(c); setForm({ name: c.name, description: c.description ?? '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) { await categoriesApi.update(editItem.id, form); toast.success('Category updated') }
      else          { await categoriesApi.create(form); toast.success('Category created') }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await categoriesApi.delete(deleteId)
      toast.success('Category removed')
      setDeleteId(null)
      load()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle={`${total} categories`}
        action={
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={14} /> New Category
          </button>
        }
      />

      <SectionCard>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={20} /></div>
        ) : items.length === 0 ? (
          <EmptyState icon={Tags} message="No categories yet" sub="Create your first category" />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 pb-2">Name</th>
                  <th className="text-left px-4 pb-2">Description</th>
                  <th className="text-center px-4 pb-2">Status</th>
                  <th className="text-right px-4 pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell text-white font-display font-bold text-xs">{c.name}</td>
                    <td className="table-cell text-steel-400 max-w-xs truncate">{c.description ?? '—'}</td>
                    <td className="table-cell text-center">
                      {c.is_active
                        ? <span className="badge-success">Active</span>
                        : <span className="badge-neutral">Inactive</span>}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-steel-400 hover:text-amber-400 transition-colors" onClick={() => openEdit(c)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="text-steel-400 hover:text-red-400 transition-colors" onClick={() => setDeleteId(c.id)}>
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

      {/* Create / Edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Category' : 'New Category'} width="max-w-md">
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Name *">
            <input className="input" value={form.name} onChange={f('name')} required autoFocus />
          </Field>
          <Field label="Description">
            <textarea className="input h-20 resize-none" value={form.description} onChange={f('description')} />
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
        title="Remove Category"
        message="This will deactivate the category. Products in this category will be unaffected."
      />
    </div>
  )
}
