/**
 * Login page — minimal, dark, industrial aesthetic.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Field } from '../components/ui'

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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#050505]">
      {/* Target Cosmic Planet Background */}
      <div className="planet" />
      
      {/* Background Star Field (Subtle CSS) */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10" 
           style={{ backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0))', backgroundSize: '200px 200px' }} />

      <div className="relative w-full max-w-[400px] animate-slide-up">
        <div className="card p-10 bg-black/40 backdrop-blur-[60px] border border-white/10 rounded-[32px] shadow-2xl">
          <div className="text-left mb-10">
            <h1 className="font-display font-medium text-4xl text-white mb-2">Sign In</h1>
            <p className="text-sm text-white/50">Keep it all together and you'll be fine</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] text-white/40 uppercase tracking-widest px-0">Email or Phone</label>
              <input
                className="input-minimal"
                type="email"
                placeholder="operator@sifs.core"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-white/40 uppercase tracking-widest px-0">Password</label>
                <button
                  type="button"
                  className="text-[10px] text-white/60 hover:text-white uppercase tracking-widest font-bold"
                  onClick={() => setShowPw(s => !s)}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                className="input-minimal"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <div className="pt-4 space-y-6">
              <button
                type="submit"
                className="btn-purple"
                disabled={loading}
              >
                {loading ? 'Signing In…' : 'Sign In'}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute w-full h-[1px] bg-white/10" />
                <span className="relative bg-[#050505]/0 px-4 text-[10px] text-white/40 uppercase tracking-[0.2em]">or</span>
              </div>

              <button
                type="button"
                className="btn-guest"
                onClick={handleGuestLogin}
                disabled={loading}
              >
                <Activity size={18} className="text-white/60" />
                <span className="text-sm">Login as Guest</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
