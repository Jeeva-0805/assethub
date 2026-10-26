import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getSetupStatus, setupInitialAdmin } from '../services/api'

function AdminSetup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    async function checkStatus() {
      try {
        const data = await getSetupStatus()
        if (isMounted) {
          if (!data.setupRequired) {
            navigate('/login', {
              replace: true,
              state: { info: 'Administrator account is already configured. Please sign in.' }
            })
            return
          }
          setLoadingStatus(false)
        }
      } catch (err) {
        if (isMounted) {
          setLoadingStatus(false)
        }
      }
    }

    checkStatus()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setSubmitting(true)
      await setupInitialAdmin({
        name: trimmedName,
        email: trimmedEmail,
        password,
        confirmPassword
      })

      navigate('/login', {
        replace: true,
        state: {
          setupSuccess: 'Initial administrator account created successfully! Please sign in with your credentials.'
        }
      })
    } catch (err) {
      setError(err.message || 'Failed to complete administrator setup. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingStatus) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-badge">⚙️</div>
            <h1 className="login-title">AssetHub</h1>
            <p className="login-subtitle">Checking system setup status...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-badge">🛡️</div>
          <h1 className="login-title">Admin Setup</h1>
          <p className="login-subtitle">
            Configure the initial administrator account for AssetHub
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
            <label htmlFor="setup-name">Full Name</label>
            <input
              id="setup-name"
              type="text"
              placeholder="System Administrator"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="setup-email">Administrator Email</label>
            <input
              id="setup-email"
              type="email"
              placeholder="admin@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="setup-password">Password</label>
            <input
              id="setup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
              minLength={6}
              required
            />
            <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Minimum 6 characters. Passwords are securely hashed with bcrypt.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="setup-confirm-password">Confirm Password</label>
            <input
              id="setup-confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-button"
            disabled={submitting}
          >
            {submitting ? 'Setting up administrator...' : 'Complete Administrator Setup'}
          </button>
        </form>

        <div className="setup-footer-link">
          <Link to="/login">Already configured? Sign In &rarr;</Link>
        </div>
      </div>
    </div>
  )
}

export default AdminSetup
