/**
 * Login page — hollow glowing ring + mega aurora, ring always behind modal.
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
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #03030c;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .login-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 360px;
          background: rgba(8, 4, 22, 0.52);
          backdrop-filter: blur(48px);
          -webkit-backdrop-filter: blur(48px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 22px;
          padding: 40px 36px;
          animation: slideUp 0.5s ease both;
        }

        .login-title {
          font-size: 26px;
          font-weight: 500;
          color: #fff;
          margin: 0 0 4px;
        }

        .login-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.36);
          margin: 0 0 32px;
          letter-spacing: 0.01em;
        }

        .login-field { margin-bottom: 24px; }

        .login-field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .login-label {
          font-size: 10px;
          color: rgba(255,255,255,0.32);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .login-show {
          font-size: 10px;
          color: rgba(255,255,255,0.45);
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
          border-bottom: 1px solid rgba(255,255,255,0.14);
          padding: 8px 0;
          font-size: 13px;
          color: rgba(255,255,255,0.82);
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.18); }
        .login-input:focus { border-bottom-color: rgba(180,140,255,0.6); }

        .login-forgot {
          display: inline-block;
          margin-top: 6px;
          font-size: 10px;
          color: rgba(255,255,255,0.32);
          cursor: pointer;
        }

        .login-btn-primary {
          width: 100%;
          padding: 12px;
          background: linear-gradient(90deg, #6d28d9, #9333ea);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 6px;
          font-family: inherit;
          transition: opacity 0.2s, transform 0.15s;
        }
        .login-btn-primary:hover:not(:disabled) { opacity: 0.88; }
        .login-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .login-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 18px 0;
        }
        .login-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .login-divider span {
          font-size: 10px;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .login-btn-guest {
          width: 100%;
          padding: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: rgba(255,255,255,0.65);
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .login-btn-guest:hover:not(:disabled) {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.18);
        }
        .login-btn-guest:active:not(:disabled) { transform: scale(0.98); }
        .login-btn-guest:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="login-wrap">

        {/* Background SVG — hollow ring + glow, z-index 0, always behind card */}
        <svg
          className="login-bg"
          viewBox="0 0 900 600"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="bloom1" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#a855f7" stopOpacity=".7"/>
              <stop offset="22%"  stopColor="#7c3aed" stopOpacity=".38"/>
              <stop offset="50%"  stopColor="#5b21b6" stopOpacity=".15"/>
              <stop offset="75%"  stopColor="#3b0764" stopOpacity=".06"/>
              <stop offset="100%" stopColor="#0a0210" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="bloom2" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#f0abfc" stopOpacity=".45"/>
              <stop offset="28%"  stopColor="#e879f9" stopOpacity=".18"/>
              <stop offset="60%"  stopColor="#a855f7" stopOpacity=".06"/>
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="rimGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#03030c" stopOpacity="1"/>
              <stop offset="66%"  stopColor="#03030c" stopOpacity="1"/>
              <stop offset="76%"  stopColor="#4c1d95" stopOpacity=".6"/>
              <stop offset="83%"  stopColor="#a855f7" stopOpacity=".92"/>
              <stop offset="88%"  stopColor="#e9d5ff" stopOpacity="1"/>
              <stop offset="91%"  stopColor="#c084fc" stopOpacity=".95"/>
              <stop offset="95%"  stopColor="#7c3aed" stopOpacity=".55"/>
              <stop offset="100%" stopColor="#2e1065" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="arcShimmer" cx="35%" cy="25%" r="35%">
              <stop offset="0%"   stopColor="#fff"    stopOpacity=".7"/>
              <stop offset="35%"  stopColor="#f9a8d4" stopOpacity=".3"/>
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="outerHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#03030c" stopOpacity="1"/>
              <stop offset="86%"  stopColor="#03030c" stopOpacity="0"/>
              <stop offset="90%"  stopColor="#9333ea" stopOpacity=".35"/>
              <stop offset="93%"  stopColor="#d8b4fe" stopOpacity=".55"/>
              <stop offset="96%"  stopColor="#9333ea" stopOpacity=".25"/>
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0"/>
            </radialGradient>
            <mask id="hollowMask">
              <circle cx="450" cy="300" r="420" fill="white"/>
              <circle cx="450" cy="300" r="310" fill="black"/>
            </mask>
            <mask id="outerHaloMask">
              <circle cx="450" cy="300" r="460" fill="white"/>
              <circle cx="450" cy="300" r="340" fill="black"/>
            </mask>
          </defs>

          {/* Stars */}
          {[
            [42,55,1],[115,30,.7],[200,75,1.1],[60,200,.8],[30,380,1],
            [80,500,.7],[180,550,1],[860,80,.8],[830,500,.9],[880,350,.7],
            [700,570,1],[350,20,.8],[550,10,.7],[750,30,1],[20,130,.6],[145,320,.9],
          ].map(([cx,cy,r],i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.4)"/>
          ))}

          {/* Mega atmospheric bloom */}
          <ellipse cx="450" cy="300" rx="680" ry="600" fill="url(#bloom1)"/>
          <ellipse cx="450" cy="300" rx="520" ry="460" fill="url(#bloom2)"/>

          {/* Hollow glowing ring */}
          <circle cx="450" cy="300" r="420" fill="url(#rimGlow)"    mask="url(#hollowMask)"/>
          <circle cx="450" cy="300" r="460" fill="url(#outerHalo)"  mask="url(#outerHaloMask)"/>
          <circle cx="450" cy="300" r="420" fill="url(#arcShimmer)" mask="url(#hollowMask)"/>

          {/* Crisp edge strokes */}
          <circle cx="450" cy="300" r="370" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeOpacity=".5"/>
          <circle cx="450" cy="300" r="375" fill="none" stroke="#e9d5ff" strokeWidth=".8"  strokeOpacity=".35"/>
          <circle cx="450" cy="300" r="365" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity=".3"/>

          {/* Small companion ring / moon */}
          <circle cx="148" cy="110" r="18" fill="none" stroke="#c4b5fd" strokeWidth="2.5" strokeOpacity=".6"/>
          <circle cx="148" cy="110" r="18" fill="none" stroke="#f3e8ff" strokeWidth=".8"  strokeOpacity=".4"/>
        </svg>

        {/* Login card — z-index 10, always in front */}
        <div className="login-card">
          <h1 className="login-title">Sign In</h1>
          <p className="login-sub">Keep it all together and you'll be fine</p>

          <form onSubmit={handleSubmit}>
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

            <button
              type="submit"
              className="login-btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <div className="login-divider-line"/>
            <span>or</span>
            <div className="login-divider-line"/>
          </div>

          <button
            type="button"
            className="login-btn-guest"
            onClick={handleGuestLogin}
            disabled={loading}
          >
            <Activity size={15} style={{ color: 'rgba(255,255,255,0.5)' }}/>
            <span>Login as Guest</span>
          </button>
        </div>

      </div>
    </>
  )
}