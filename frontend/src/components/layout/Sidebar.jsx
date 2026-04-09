/**
 * Sidebar — persistent left navigation with active state and user info.
 */
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp,
  AlertTriangle, Tags, Truck, LogOut, Activity,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',  icon: Package,         label: 'Assets'  },
  { to: '/sales',     icon: ShoppingCart,    label: 'Sales'     },
  { to: '/forecast',  icon: TrendingUp,      label: 'Analytics'  },
  { to: '/alerts',    icon: AlertTriangle,   label: 'Alerts'    },
  { to: '/categories',icon: Tags,            label: 'Categories'},
  { to: '/suppliers', icon: Truck,           label: 'Suppliers' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-ink-950 border-r border-white/[0.02] flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-[0_0_15px_rgba(169,85,255,0.3)]">
            <Activity size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-white leading-none tracking-wide">SIFS<span className="text-primary-500">®</span></div>
            <div className="font-mono text-[9px] text-steel-400 tracking-widest mt-1 uppercase">Inventory Sys</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-mono text-steel-500 uppercase tracking-widest mb-3 px-2">Main Menu</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-ink-800 border border-white/[0.05] text-white shadow-md'
                  : 'text-steel-400 hover:text-steel-200 hover:bg-white/[0.02]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-primary-400' : 'text-steel-400 group-hover:text-steel-300'} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`font-mono text-[13px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
                {isActive && label === 'Dashboard' && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_5px_rgba(169,85,255,0.8)]"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-ink-900 border border-white/[0.03]">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
            <span className="font-mono text-sm text-primary-400 font-bold">
              {user?.full_name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-sm text-white truncate">{user?.full_name || 'Admin'}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
               <div className="font-mono text-[10px] text-steel-400 uppercase tracking-widest leading-none">Online</div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-steel-400 border border-white/[0.02]
                     hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <LogOut size={14} />
          <span className="font-mono text-xs font-medium">Disconnect</span>
        </button>
      </div>
    </aside>
  )
}
