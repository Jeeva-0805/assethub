import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      setSubmitting(true)
      await loginUser(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemoAdmin = () => {
    setEmail('admin@assethub.com')
    setPassword('admin123')
    setError('')
  }

  const fillDemoManager = () => {
    setEmail('manager@assethub.com')
    setPassword('manager123')
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-badge">📦</div>
          <h1 className="login-title">AssetHub</h1>
          <p className="login-subtitle">
            Smart Inventory and Asset Management System
          </p>
        </div>

        {error && (
          <div className="login-alert error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-button"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In to AssetHub'}
          </button>
        </form>

        <div className="demo-credentials-box">
          <p className="demo-title">Quick Demo Login:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-pill"
              onClick={fillDemoAdmin}
            >
              🔑 Admin
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={fillDemoManager}
            >
              🔬 Lab Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
