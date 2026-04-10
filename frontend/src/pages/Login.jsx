/**
 * Login page — cosmic dark aesthetic, Atomz-inspired.
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #07071a;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        /* --- Planet --- */
        .login-planet {
          position: absolute;
          right: -80px;
          top: -80px;
          width: 460px;
          height: 460px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 35% 40%,
            #9b6bff 0%,
            #6b3ab5 30%,
            #2a1060 65%,
            #0a0520 100%
          );
          box-shadow:
            inset -40px 25px 80px rgba(255, 180, 255, 0.25),
            inset 12px -12px 50px rgba(80, 20, 180, 0.5);
          pointer-events: none;
        }

        .login-glow {
          position: absolute;
          right: 100px;
          top: 220px;
          width: 160px;
          height: 80px;
          background: radial-gradient(ellipse, rgba(220, 160, 255, 0.45) 0%, transparent 70%);
          filter: blur(12px);
          pointer-events: none;
        }

        .login-moon {
          position: absolute;
          left: 12%;
          top: 12%;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: radial-gradient(circle at 38% 35%, #c0b0e0, #7a6a9a);
          pointer-events: none;
        }

        /* --- Stars --- */
        .login-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* --- Card --- */
        .login-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 360px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px 36px;
          animation: slideUp 0.5s ease both;
        }

        .login-title {
          font-size: 26px;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .login-sub {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.38);
          margin: 0 0 32px;
          letter-spacing: 0.01em;
        }

        /* --- Fields --- */
        .login-field {
          margin-bottom: 24px;
        }

        .login-field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .login-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .login-show {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 0;
          font-family: inherit;
        }

        .login-show:hover { color: #fff; }

        .login-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding: 8px 0;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .login-input::placeholder { color: rgba(255, 255, 255, 0.2); }
        .login-input:focus { border-bottom-color: rgba(255, 255, 255, 0.45); }

        .login-forgot {
          display: inline-block;
          margin-top: 6px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.38);
          cursor: pointer;
          letter-spacing: 0.03em;
        }

        /* --- Buttons --- */
        .login-btn-primary {
          width: 100%;
          padding: 12px;
          background: linear-gradient(90deg, #7c3aed, #a855f7);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
          font-family: inherit;
          transition: opacity 0.2s, transform 0.15s;
        }

        .login-btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .login-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .login-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .login-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .login-divider span {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .login-btn-guest {
          width: 100%;
          padding: 11px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }

        .login-btn-guest:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .login-btn-guest:active:not(:disabled) { transform: scale(0.98); }
        .login-btn-guest:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="login-wrap">
        {/* Stars */}
        <svg className="login-stars" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {[
            [40,90,1],[100,220,0.8],[180,45,1.2],[230,330,0.7],[60,400,1],
            [140,490,0.8],[500,510,1],[580,420,0.7],[25,170,0.6],[620,55,1],
            [700,200,0.8],[760,350,0.7],[310,520,0.9],[450,30,1.1],[680,480,0.8],
            [200,150,0.6],[350,80,0.9],[550,300,0.7],[120,300,0.8],[660,130,1],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={`rgba(255,255,255,${0.3 + Math.random() * 0.3})`} />
          ))}
        </svg>

        {/* Planet + glow + moon */}
        <div className="login-planet" />
        <div className="login-glow" />
        <div className="login-moon" />

        {/* Card */}
        <div className="login-card">
          <h1 className="login-title">Sign In</h1>
          <p className="login-sub">Keep it all together and you'll be fine</p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="login-field">
              <div className="login-field-row">
                <label className="login-label">Email or Phone</label>
              </div>
              <input
                className="login-input"
                type="email"
                placeholder="operator@sifs.core"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-field-row">
                <label className="login-label">Password</label>
                <button
                  type="button"
                  className="login-show"
                  onClick={() => setShowPw(s => !s)}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                className="login-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <span className="login-forgot">Forgot Password</span>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              className="login-btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span>or</span>
            <div className="login-divider-line" />
          </div>

          {/* Guest Login */}
          <button
            type="button"
            className="login-btn-guest"
            onClick={handleGuestLogin}
            disabled={loading}
          >
            <Activity size={16} style={{ color: 'rgba(255,255,255,0.55)' }} />
            <span>Login as Guest</span>
          </button>
        </div>
      </div>
    </>
  )
}