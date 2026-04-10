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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/[0.03] backdrop-blur-[24px] border-r border-white/10 flex flex-col z-40 shadow-2xl">
      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4 px-3">Navigation</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-white/[0.08] text-white shadow-[inset_0_0_15px_rgba(140,100,255,0.15)]'
                  : 'text-steel hover:text-white hover:bg-white/[0.04]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                   <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full shadow-[0_0_10px_rgba(100,160,255,0.6)]" />
                )}
                <Icon size={18} className={isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-steel group-hover:text-white transition-colors'} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`font-mono text-[13px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-blue-400 animate-pulse shadow-[0_0_5px_rgba(96,165,250,1)]"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 mx-3 mb-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3 px-1 py-1 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-inner">
            <span className="font-mono text-sm text-blue-300 font-black">
              {user?.full_name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-sm text-white truncate">{user?.full_name || 'Terminal User'}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_#22C55E]"></div>
               <div className="font-mono text-[9px] text-steel uppercase tracking-widest leading-none">Status: Secured</div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-steel bg-white/5 border border-white/10
                     backdrop-blur-md hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
        >
          <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Terminate Session</span>
        </button>
      </div>
    </aside>
  )
}
