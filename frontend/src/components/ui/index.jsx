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
    <div className="flex items-end justify-between mb-10 pb-6 border-b border-white/[0.05] animate-fade-in">
      <div>
        <h1 className="font-display font-black text-3xl text-white tracking-tight">{title}</h1>
        {subtitle && <p className="font-mono text-[10px] text-steel mt-2 uppercase tracking-[0.2em]">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, sub, icon: Icon, accent = false, delay = 0 }) {
  return (
    <div
      className={`card p-6 animate-slide-up flex flex-col gap-4 relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95 ${accent ? 'bg-[rgba(100,50,200,0.15)] border-t-[rgba(160,120,255,0.4)]' : 'bg-[rgba(60,100,220,0.1)] border-t-[rgba(120,180,255,0.2)]'}`}
      style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-steel uppercase tracking-[0.2em] font-bold">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${accent ? 'bg-purple-500/10 border-purple-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
            <Icon size={14} className={accent ? 'text-purple-400' : 'text-blue-400'} />
          </div>
        )}
      </div>
      <div className={`font-display font-black text-3xl ${accent ? 'text-white' : 'text-white'}`}>
        {value}
      </div>
      {sub && <div className="font-mono text-[10px] text-steel tracking-wider">{sub}</div>}
    </div>
  )
}

// ── Section Card ──────────────────────────────────────────────────────────────
export function SectionCard({ title, children, action, className = '' }) {
  return (
    <div className={`card p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h2 className="font-display font-black text-xs text-white uppercase tracking-[0.2em]">{title}</h2>}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative card w-full ${width} animate-slide-up shadow-2xl overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h3 className="font-display font-black text-xs text-white uppercase tracking-[0.2em]">{title}</h3>
          <button onClick={onClose} className="text-steel hover:text-white transition-all hover:rotate-90">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, message, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
          <Icon size={24} className="text-steel/50" />
        </div>
      )}
      <p className="font-mono text-sm text-steel font-medium tracking-wide">{message}</p>
      {sub && <p className="font-mono text-[10px] text-steel/40 mt-2 uppercase tracking-widest">{sub}</p>}
    </div>
  )
}

// ── Stock Badge ────────────────────────────────────────────────────────────────
export function StockBadge({ stock, reorderPoint }) {
  if (stock === 0) return <span className="badge-danger">Out of stock</span>
  if (stock <= reorderPoint) return <span className="badge-warning">Restock needed</span>
  return <span className="badge-success">Operational</span>
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="font-mono text-sm text-steel/80 mb-8 leading-relaxed">{message}</p>
      <div className="flex gap-4 justify-end">
        <button className="btn-ghost" onClick={onClose}>Abort</button>
        <button className="btn-danger !px-6" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={14} /> : 'Proceed'}
        </button>
      </div>
    </Modal>
  )
}

// ── Form Field ─────────────────────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <label className="input-label">{label}</label>
      {children}
      {error && <p className="font-mono text-[10px] text-danger mt-1 uppercase tracking-widest font-bold">{error}</p>}
    </div>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center gap-3 justify-end mt-6">
      <button
        className="btn-ghost !px-4 !py-1.5 text-[10px] font-black uppercase tracking-widest"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg flex items-center gap-2">
         <span className="font-mono text-[10px] text-white font-black">{page}</span>
         <span className="font-mono text-[9px] text-steel font-bold uppercase tracking-widest">/ {pages}</span>
      </div>
      <button
        className="btn-ghost !px-4 !py-1.5 text-[10px] font-black uppercase tracking-widest"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}
