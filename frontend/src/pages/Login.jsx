/**
 * Login page — minimal, dark, industrial aesthetic.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Access granted')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    try {
      await login('guest@warehouse.com', 'guestpassword')
      toast.success('Guest access granted')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Guest login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--amber) 1px, transparent 1px), linear-gradient(90deg, var(--amber) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-amber-400 rounded-sm flex items-center justify-center">
            <Activity size={18} className="text-ink-950" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-xl text-white leading-none">SIFS</div>
            <div className="font-mono text-[9px] text-steel-400 tracking-[0.2em] mt-0.5">INVENTORY SYSTEM</div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-bold text-lg text-white mb-1">System Access</h2>
          <p className="font-mono text-xs text-steel-400 mb-6">Enter credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email address</label>
              <input
                className="input"
                type="email"
                placeholder="admin@warehouse.com"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-200"
                  onClick={() => setShowPw(s => !s)}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2 py-2.5"
              disabled={loading}
            >
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>

            <button
              type="button"
              className="btn-secondary w-full mt-2 py-2.5 flex items-center justify-center gap-2"
              onClick={handleGuestLogin}
              disabled={loading}
            >
              Sign in as Guest
            </button>
          </form>
        </div>

        <p className="font-mono text-[10px] text-ink-500 text-center mt-6 tracking-widest">
          SMART INVENTORY FORECASTING SYSTEM v1.0
        </p>
      </div>
    </div>
  )
}
