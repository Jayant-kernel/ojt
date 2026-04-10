/**
 * Login page — SIFS split-panel aesthetic.
 * All auth logic preserved from original.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity } from 'lucide-react'
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
    <>
      <style>{`
        @keyframes sifsSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sifs-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111020;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* Ambient glows */
        .sifs-glow1 {
          position: fixed;
          top: -10%; left: 10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .sifs-glow2 {
          position: fixed;
          bottom: 10%; right: 10%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .sifs-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 900px;
          min-height: 480px;
          background: #1a1825;
          border-radius: 18px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid rgba(255,255,255,0.08);
          animation: sifsSlideUp 0.5s ease both;
        }

        /* ── Left panel ── */
        .sifs-left {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2rem;
        }
        .sifs-left-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, #6b35c8 0%, #3a1e7a 40%, #1a0e3d 80%);
          opacity: 0.85;
        }
        .sifs-dune1 {
          position: absolute; bottom: 30%; left: -10%;
          width: 140%; height: 60%;
          background: rgba(40,20,80,0.7);
          border-radius: 60% 60% 0 0 / 40% 40% 0 0;
        }
        .sifs-dune2 {
          position: absolute; bottom: 15%; left: -5%;
          width: 120%; height: 50%;
          background: rgba(25,12,55,0.85);
          border-radius: 55% 55% 0 0 / 35% 35% 0 0;
        }
        .sifs-dune3 {
          position: absolute; bottom: 0; left: 0;
          width: 100%; height: 35%;
          background: rgba(15,8,35,0.95);
          border-radius: 45% 45% 0 0 / 25% 25% 0 0;
        }
        .sifs-logo {
          position: absolute;
          top: 1.5rem; left: 1.75rem;
          font-size: 20px; font-weight: 700;
          color: #fff; letter-spacing: 3px;
          z-index: 10;
        }
        .sifs-tagline {
          position: relative;
          z-index: 10;
        }
        .sifs-tagline h2 {
          font-size: 22px; font-weight: 500;
          color: #fff; line-height: 1.4;
          margin: 0;
        }
        .sifs-dots {
          display: flex; gap: 6px;
          margin-top: 1.25rem;
        }
        .sifs-dot {
          height: 3px; border-radius: 2px;
          background: rgba(255,255,255,0.35);
          width: 24px;
        }
        .sifs-dot.active {
          background: #fff;
          width: 32px;
        }

        /* ── Right panel ── */
        .sifs-right {
          padding: 2.75rem 2.25rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .sifs-title {
          font-size: 28px; font-weight: 500;
          color: #fff; margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .sifs-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.32);
          margin: 0 0 2rem;
          letter-spacing: 0.01em;
        }

        .sifs-field { margin-bottom: 1.25rem; }
        .sifs-field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .sifs-label {
          font-size: 10px;
          color: rgba(255,255,255,0.32);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .sifs-show {
          font-size: 10px;
          color: rgba(255,255,255,0.45);
          background: none; border: none;
          cursor: pointer;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600; padding: 0;
          font-family: inherit;
          transition: color 0.2s;
        }
        .sifs-show:hover { color: #fff; }

        .sifs-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.14);
          padding: 8px 0;
          font-size: 13px;
          color: rgba(255,255,255,0.82);
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .sifs-input::placeholder { color: rgba(255,255,255,0.18); }
        .sifs-input:focus { border-bottom-color: rgba(180,140,255,0.6); }

        .sifs-forgot {
          display: inline-block;
          margin-top: 6px;
          font-size: 10px;
          color: rgba(255,255,255,0.32);
          cursor: pointer;
        }

        .sifs-btn-primary {
          width: 100%; padding: 12px;
          background: linear-gradient(90deg, #6d28d9, #9333ea);
          border: none; border-radius: 10px;
          color: #fff; font-size: 13px; font-weight: 500;
          cursor: pointer; margin-top: 6px;
          font-family: inherit;
          transition: opacity 0.2s, transform 0.15s;
        }
        .sifs-btn-primary:hover:not(:disabled) { opacity: 0.88; }
        .sifs-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .sifs-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .sifs-divider {
          display: flex; align-items: center;
          gap: 10px; margin: 18px 0;
        }
        .sifs-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .sifs-divider span {
          font-size: 10px; color: rgba(255,255,255,0.28);
          letter-spacing: 0.18em; text-transform: uppercase;
        }

        .sifs-btn-guest {
          width: 100%; padding: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: rgba(255,255,255,0.65);
          font-size: 12px; cursor: pointer;
          display: flex; align-items: center;
          justify-content: center; gap: 8px;
          font-family: inherit;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .sifs-btn-guest:hover:not(:disabled) {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.18);
        }
        .sifs-btn-guest:active:not(:disabled) { transform: scale(0.98); }
        .sifs-btn-guest:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 600px) {
          .sifs-card { grid-template-columns: 1fr; }
          .sifs-left { display: none; }
        }
      `}</style>

      <div className="sifs-wrap">
        <div className="sifs-glow1" />
        <div className="sifs-glow2" />

        <div className="sifs-card">

          {/* ── Left panel ── */}
          <div className="sifs-left">
            <div className="sifs-left-bg" />
            <div className="sifs-dune1" />
            <div className="sifs-dune2" />
            <div className="sifs-dune3" />
            <div className="sifs-logo">SIFS</div>
            <div className="sifs-tagline">
              <h2>Capturing Moments,<br />Creating Memories</h2>
              <div className="sifs-dots">
                <div className="sifs-dot" />
                <div className="sifs-dot" />
                <div className="sifs-dot active" />
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="sifs-right">
            <h1 className="sifs-title">Sign In</h1>
            <p className="sifs-sub">Keep it all together and you'll be fine</p>

            <form onSubmit={handleSubmit}>
              <div className="sifs-field">
                <div className="sifs-field-row">
                  <label className="sifs-label">Email or Phone</label>
                </div>
                <input
                  className="sifs-input"
                  type="email"
                  placeholder="operator@sifs.core"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>

              <div className="sifs-field">
                <div className="sifs-field-row">
                  <label className="sifs-label">Password</label>
                  <button
                    type="button"
                    className="sifs-show"
                    onClick={() => setShowPw(s => !s)}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  className="sifs-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <span className="sifs-forgot">Forgot Password</span>
              </div>

              <button
                type="submit"
                className="sifs-btn-primary"
                disabled={loading}
              >
                {loading ? 'Signing In…' : 'Sign In'}
              </button>
            </form>

            <div className="sifs-divider">
              <div className="sifs-divider-line" />
              <span>or</span>
              <div className="sifs-divider-line" />
            </div>

            <button
              type="button"
              className="sifs-btn-guest"
              onClick={handleGuestLogin}
              disabled={loading}
            >
              <Activity size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span>Login as Guest</span>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}