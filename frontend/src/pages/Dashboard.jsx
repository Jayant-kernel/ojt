/**
 * Login — SIFS sign-in page.
 * Matches the crypto/dark aesthetic from Dashboard.jsx.
 */
import { useState } from 'react'
import { Eye, EyeOff, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }
    setLoading(true)
    try {
      // TODO: replace with your real auth call e.g. await authApi.login({ email, password })
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('Signed in successfully')
    } catch {
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setLoading(true)
    try {
      // TODO: replace with your real guest auth call e.g. await authApi.loginAsGuest()
      await new Promise((r) => setTimeout(r, 800))
      toast.success('Continuing as guest')
    } catch {
      toast.error('Failed to continue as guest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111020] px-4 py-8">

      {/* Ambient glows — matches Dashboard */}
      <div className="fixed top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary-600/15 rounded-full blur-[140px] pointer-events-none -z-10 mix-blend-screen" />
      <div className="fixed bottom-[10%] right-[10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="w-full max-w-[900px] min-h-[480px] bg-[#1a1825] rounded-[18px] overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-white/[0.08] animate-fade-in">

        {/* ── Left panel ── */}
        <div className="relative hidden md:flex flex-col justify-end p-8 overflow-hidden">
          {/* bg layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6b35c8] via-[#3a1e7a] to-[#1a0e3d] opacity-85" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-[30%] -left-[10%] w-[140%] h-[60%] bg-[rgba(40,20,80,0.7)] rounded-[60%_60%_0_0/40%_40%_0_0]" />
            <div className="absolute bottom-[15%] -left-[5%] w-[120%] h-[50%] bg-[rgba(25,12,55,0.85)] rounded-[55%_55%_0_0/35%_35%_0_0]" />
            <div className="absolute bottom-0 left-0 w-full h-[35%] bg-[rgba(15,8,35,0.95)] rounded-[45%_45%_0_0/25%_25%_0_0]" />
          </div>

          {/* Logo */}
          <div className="absolute top-6 left-7 z-10 font-display font-bold text-white text-xl tracking-[3px]">
            SIFS
          </div>

          {/* Tagline */}
          <div className="relative z-10">
            <h2 className="font-display font-medium text-white text-[22px] leading-snug">
              Capturing Moments,<br />Creating Memories
            </h2>
            <div className="flex gap-1.5 mt-5">
              <div className="h-[3px] w-6 rounded-full bg-white/35" />
              <div className="h-[3px] w-6 rounded-full bg-white/35" />
              <div className="h-[3px] w-8 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-col justify-center px-8 py-10 md:px-9">

          <h1 className="font-display font-medium text-white text-[28px] mb-1 tracking-tight">
            Welcome back
          </h1>
          <p className="text-[13px] text-steel-400 mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSignIn} className="flex flex-col gap-3 mb-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/10 rounded-[10px] px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary-400/55 transition-colors font-mono"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/10 rounded-[10px] px-4 py-3 pr-11 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary-400/55 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[12px] font-mono text-white/28 whitespace-nowrap">Or continue as</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Guest */}
          <button
            onClick={handleGuest}
            disabled={loading}
            className="btn-ghost w-full !py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <User size={15} className="opacity-60" />
            <span className="font-mono text-[13px]">Continue as guest</span>
          </button>

        </div>
      </div>
    </div>
  )
}