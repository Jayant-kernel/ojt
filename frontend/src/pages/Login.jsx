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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="relative w-full max-w-[420px] animate-slide-up">
        {/* Simplified Header */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="font-display font-black text-5xl text-white tracking-[0.2em] drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            SIFS
          </h1>
        </div>

        <div className="relative bg-white/[0.01] backdrop-blur-[40px] border border-white/10 rounded-[32px] p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
          
          <div className="mb-10 text-center">
             <h2 className="font-display font-black text-xl text-white/90 mb-2 uppercase tracking-[0.2em]">Secure Access</h2>
             <div className="flex items-center justify-center gap-2 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <p className="font-mono text-[9px] text-steel uppercase tracking-widest font-bold">Terminal Online</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="Operator Identification">
              <input
                className="input"
                type="email"
                placeholder="operator@sifs.core"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoFocus
              />
            </Field>

            <Field label="Security Keycode">
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-steel hover:text-white transition-colors"
                  onClick={() => setShowPw(s => !s)}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="pt-2 space-y-4">
              <button
                type="submit"
                className="btn-primary w-full py-3.5 !rounded-xl !text-[11px] font-black uppercase tracking-[0.2em]"
                disabled={loading}
              >
                {loading ? 'Decrypting Access…' : 'Initialize Session'}
              </button>

              <button
                type="button"
                className="btn-ghost w-full py-3 !rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border-white/5 hover:bg-white/5 active:scale-95"
                onClick={handleGuestLogin}
                disabled={loading}
              >
                Guest Protocol
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
