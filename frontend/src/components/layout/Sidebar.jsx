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
  { to: '/products',  icon: Package,         label: 'Products'  },
  { to: '/sales',     icon: ShoppingCart,    label: 'Sales'     },
  { to: '/forecast',  icon: TrendingUp,      label: 'Forecast'  },
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
    <aside className="fixed left-0 top-0 h-screen w-56 bg-ink-900 border-r border-ink-700 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-ink-700">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-400 rounded-sm flex items-center justify-center">
            <Activity size={14} className="text-ink-950" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-white leading-none">SIFS</div>
            <div className="font-mono text-[9px] text-steel-400 tracking-widest mt-0.5">INVENTORY SYS</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 group ${
                isActive
                  ? 'bg-amber-400/10 text-amber-400 border-l-2 border-amber-400 pl-[10px]'
                  : 'text-steel-400 hover:text-steel-200 hover:bg-ink-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-mono text-xs tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-ink-700 p-3">
        <div className="flex items-center gap-2 px-2 py-2 mb-1">
          <div className="w-7 h-7 rounded-sm bg-ink-700 flex items-center justify-center">
            <span className="font-mono text-xs text-amber-400 font-bold">
              {user?.full_name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs text-steel-200 truncate">{user?.full_name}</div>
            <div className="font-mono text-[10px] text-steel-400 uppercase tracking-widest">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-steel-400
                     hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
        >
          <LogOut size={13} />
          <span className="font-mono text-xs">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
