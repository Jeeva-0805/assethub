import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Sidebar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <h2 className="logo">AssetHub</h2>
        {user && (
          <div className="sidebar-user-badge">
            <span className="user-avatar-circle">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
            <div className="user-badge-info">
              <span className="user-badge-name">{user.name}</span>
              <span className="user-badge-role">{user.role}</span>
            </div>
          </div>
        )}
      </div>

      <nav className="navigation">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          🏠 Dashboard
        </NavLink>

        <NavLink
          to="/assets"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          📦 Assets
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          📋 Inventory
        </NavLink>

        <NavLink
          to="/maintenance"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          🔧 Maintenance
        </NavLink>

        <NavLink
          to="/usage"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          🔄 Usage
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          📊 Reports
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "active-link settings-nav-link" : "settings-nav-link")}
        >
          ⚙ Settings
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout-button"
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar