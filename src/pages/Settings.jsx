import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Settings() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account preferences and system overview.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* User Profile Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon">👤</span>
            <div>
              <h2>User Profile</h2>
              <p>Your current session and credentials</p>
            </div>
          </div>

          <div className="settings-details">
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user?.name || 'User'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user?.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Role</span>
              <span className="detail-value role-badge">{user?.role || 'Admin'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Session Status</span>
              <span className="detail-value session-active">● Active (Token authenticated)</span>
            </div>
          </div>

          <div className="settings-actions">
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* System Information Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon">ℹ️</span>
            <div>
              <h2>Application Info</h2>
              <p>System configuration & academic metadata</p>
            </div>
          </div>

          <div className="settings-details">
            <div className="detail-row">
              <span className="detail-label">Project Name</span>
              <span className="detail-value">AssetHub</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Academic Title</span>
              <span className="detail-value">
                Smart Inventory & Asset Management System
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Architecture</span>
              <span className="detail-value">MERN (MongoDB, Express, React, Node)</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Database Status</span>
              <span className="detail-value session-active">● MongoDB Connected</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Version</span>
              <span className="detail-value">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Settings
