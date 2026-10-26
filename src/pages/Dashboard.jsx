import { useEffect, useState } from 'react'
import { getReportsSummary } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getReportsSummary()
      setData(res)
    } catch (err) {
      console.error("Dashboard load failed:", err)
      setError(err.message || "Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <main className="main-content">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard metrics...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="error-state">
          <p className="error-message">⚠️ {error}</p>
          <button className="retry-button" onClick={fetchDashboardData}>
            🔄 Try Again
          </button>
        </div>
      </main>
    )
  }

  const assetSummary = data?.asset || { total: 0, available: 0, inUse: 0, maintenance: 0, list: [] }
  const recentAssets = (assetSummary.list || []).slice(0, 5)

  // Generate activities dynamically from real database records
  const activities = []

  if (assetSummary.list && assetSummary.list.length > 0) {
    activities.push({
      id: `asset-${assetSummary.list[0]._id}`,
      message: `${assetSummary.list[0].name} was registered in ${assetSummary.list[0].location}`,
      time: new Date(assetSummary.list[0].createdAt || Date.now()).toLocaleDateString()
    })
  }

  if (data?.maintenance?.list && data.maintenance.list.length > 0) {
    const latestMaint = data.maintenance.list[0]
    activities.push({
      id: `maint-${latestMaint._id}`,
      message: `${latestMaint.asset} maintenance: ${latestMaint.type} (${latestMaint.status})`,
      time: new Date(latestMaint.date).toLocaleDateString()
    })
  }

  if (data?.usage?.list && data.usage.list.length > 0) {
    const latestUsage = data.usage.list[0]
    activities.push({
      id: `usage-${latestUsage._id}`,
      message: `${latestUsage.user} checked out ${latestUsage.asset} for ${latestUsage.purpose}`,
      time: new Date(latestUsage.startDate).toLocaleDateString()
    })
  }

  if (data?.inventory?.list && data.inventory.list.length > 0) {
    const lowStock = data.inventory.list.find((i) => i.available <= i.reorderLevel)
    if (lowStock) {
      activities.push({
        id: `lowstock-${lowStock._id}`,
        message: `Low stock alert: ${lowStock.name} has only ${lowStock.available} available (Reorder: ${lowStock.reorderLevel})`,
        time: "Needs Attention"
      })
    }
  }

  return (
    <main className="main-content">
      <h1>Dashboard</h1>
      <p>Welcome back, {user?.name || "Admin"} 👋</p>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-top">
            <span className="card-icon">📦</span>
            <span className="card-label">Total Assets</span>
          </div>
          <h2>{assetSummary.total}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">✓</span>
            <span className="card-label">Available</span>
          </div>
          <h2>{assetSummary.available}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">↗</span>
            <span className="card-label">In Use</span>
          </div>
          <h2>{assetSummary.inUse}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">🔧</span>
            <span className="card-label">Maintenance</span>
          </div>
          <h2>{assetSummary.maintenance}</h2>
        </div>
      </div>

      {/* Recent Assets */}
      <div className="recent-assets">
        <h2>Recent Assets</h2>
        {recentAssets.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.map((asset) => (
                <tr key={asset._id || asset.id}>
                  <td>{asset.name}</td>
                  <td>{asset.category}</td>
                  <td>
                    <span
                      className={`status ${asset.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td>{asset.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-assets">No assets registered yet in the system.</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <span className="activity-dot"></span>
                <div>
                  <p>{activity.message}</p>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-activity">No recent activities recorded.</p>
          )}
        </div>
      </div>
    </main>
  )
}

export default Dashboard
