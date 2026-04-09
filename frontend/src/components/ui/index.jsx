/**
 * Shared UI primitives used across all pages.
 */
import { X, Loader2 } from 'lucide-react'

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 16 }) {
  return <Loader2 size={size} className="animate-spin text-primary-400" />
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">{title}</h1>
        {subtitle && <p className="font-mono text-xs text-steel-400 mt-1 tracking-wide">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, sub, icon: Icon, accent = false, delay = 0 }) {
  return (
    <div
      className={`card p-5 animate-slide-up flex flex-col gap-3 ${accent ? 'border-primary-400/30 bg-primary-400/5' : ''}`}
      style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-steel-400 uppercase tracking-widest">{label}</span>
        {Icon && (
          <div className={`w-7 h-7 rounded-sm flex items-center justify-center ${accent ? 'bg-primary-400/20' : 'bg-ink-700'}`}>
            <Icon size={13} className={accent ? 'text-primary-400' : 'text-steel-400'} />
          </div>
        )}
      </div>
      <div className={`font-display font-bold text-3xl ${accent ? 'text-primary-400' : 'text-white'}`}>
        {value}
      </div>
      {sub && <div className="font-mono text-[10px] text-steel-400">{sub}</div>}
    </div>
  )
}

// ── Section Card ──────────────────────────────────────────────────────────────
export function SectionCard({ title, children, action, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative card w-full ${width} animate-slide-up shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-700">
          <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="text-steel-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, message, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-lg bg-ink-800 flex items-center justify-center mb-4">
          <Icon size={20} className="text-steel-400" />
        </div>
      )}
      <p className="font-mono text-sm text-steel-400">{message}</p>
      {sub && <p className="font-mono text-xs text-ink-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── Stock Badge ────────────────────────────────────────────────────────────────
export function StockBadge({ stock, reorderPoint }) {
  if (stock === 0) return <span className="badge-danger">Out of stock</span>
  if (stock <= reorderPoint) return <span className="badge-warning">Low stock</span>
  return <span className="badge-success">In stock</span>
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="font-mono text-sm text-steel-300 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={14} /> : 'Confirm'}
        </button>
      </div>
    </Modal>
  )
}

// ── Form Field ─────────────────────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
      {error && <p className="font-mono text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center gap-2 justify-end mt-4">
      <button
        className="btn-ghost px-3 py-1.5 text-xs"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span className="font-mono text-xs text-steel-400">
        {page} / {pages}
      </span>
      <button
        className="btn-ghost px-3 py-1.5 text-xs"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}
