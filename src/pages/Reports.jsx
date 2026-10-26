import { useEffect, useState } from 'react'
import { getReportsSummary } from '../services/api'

function Reports() {
  const [reportFilter, setReportFilter] = useState("all")
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getReportsSummary()
      setReportData(data)
    } catch (err) {
      console.error("Failed to load reports:", err)
      setError(err.message || "Failed to load reports. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Working CSV Export implementation
  const handleExportCSV = () => {
    if (!reportData) return

    let csvContent = "data:text/csv;charset=utf-8,"
    let filename = `AssetHub_Report_${reportFilter}_${new Date().toISOString().split('T')[0]}.csv`

    if (reportFilter === "all" || reportFilter === "assets") {
      csvContent += "=== ASSETS REPORT ===\r\n"
      csvContent += "Name,Category,Status,Location\r\n"
      reportData.asset.list.forEach((a) => {
        csvContent += `"${a.name}","${a.category}","${a.status}","${a.location}"\r\n`
      })
      csvContent += "\r\n"
    }

    if (reportFilter === "all" || reportFilter === "inventory") {
      csvContent += "=== INVENTORY REPORT ===\r\n"
      csvContent += "Item Name,Category,Total,Available,Issued,Reorder Level\r\n"
      reportData.inventory.list.forEach((i) => {
        csvContent += `"${i.name}","${i.category}",${i.total},${i.available},${i.issued},${i.reorderLevel}\r\n`
      })
      csvContent += "\r\n"
    }

    if (reportFilter === "all" || reportFilter === "maintenance") {
      csvContent += "=== MAINTENANCE REPORT ===\r\n"
      csvContent += "Asset,Type,Date,Technician,Cost,Status\r\n"
      reportData.maintenance.list.forEach((m) => {
        const d = m.date ? new Date(m.date).toLocaleDateString() : ""
        csvContent += `"${m.asset}","${m.type}","${d}","${m.technician}",${m.cost},"${m.status}"\r\n`
      })
      csvContent += "\r\n"
    }

    if (reportFilter === "all" || reportFilter === "usage") {
      csvContent += "=== USAGE REPORT ===\r\n"
      csvContent += "Asset,User,Purpose,Start Date,End Date,Status\r\n"
      reportData.usage.list.forEach((u) => {
        const s = u.startDate ? new Date(u.startDate).toLocaleDateString() : ""
        const e = u.endDate ? new Date(u.endDate).toLocaleDateString() : ""
        csvContent += `"${u.asset}","${u.user}","${u.purpose}","${s}","${e}","${u.status}"\r\n`
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Reports</h1>
            <p>System-wide audits and analytical summaries.</p>
          </div>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating reports from MongoDB...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Reports</h1>
            <p>System-wide audits and analytical summaries.</p>
          </div>
        </div>
        <div className="error-state">
          <p className="error-message">⚠️ {error}</p>
          <button className="retry-button" onClick={fetchReports}>
            🔄 Try Again
          </button>
        </div>
      </main>
    )
  }

  const { asset, inventory, maintenance, usage } = reportData

  return (
    <main className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>
            Comprehensive analytics and audit summaries across all modules.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            className="report-filter"
            value={reportFilter}
            onChange={(e) => setReportFilter(e.target.value)}
          >
            <option value="all">All Reports</option>
            <option value="assets">Assets Only</option>
            <option value="inventory">Inventory Only</option>
            <option value="maintenance">Maintenance Only</option>
            <option value="usage">Usage Only</option>
          </select>

          <button
            type="button"
            className="export-button"
            onClick={handleExportCSV}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* 1. ASSET SECTION */}
      {(reportFilter === "all" || reportFilter === "assets") && (
        <section className="report-section">
          <div className="report-section-header">
            <div>
              <h2>Asset Overview</h2>
              <p>Physical equipment and institutional hardware summary</p>
            </div>
          </div>

          <div className="report-stats">
            <div className="report-stat">
              <span>Total Assets</span>
              <strong>{asset.total}</strong>
            </div>

            <div className="report-stat">
              <span>Available</span>
              <strong>{asset.available}</strong>
            </div>

            <div className="report-stat">
              <span>In Use</span>
              <strong>{asset.inUse}</strong>
            </div>

            <div className="report-stat">
              <span>Under Maintenance</span>
              <strong>{asset.maintenance}</strong>
            </div>
          </div>

          <div className="assets-table-container" style={{ marginTop: 20 }}>
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
                {asset.list.length > 0 ? (
                  asset.list.map((a) => (
                    <tr key={a._id || a.id}>
                      <td>{a.name}</td>
                      <td>{a.category}</td>
                      <td>
                        <span
                          className={`status ${a.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>{a.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-assets">
                      No asset records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 2. INVENTORY SECTION */}
      {(reportFilter === "all" || reportFilter === "inventory") && (
        <section className="report-section">
          <div className="report-section-header">
            <div>
              <h2>Inventory Overview</h2>
              <p>Consumables stock levels and reorder alerts</p>
            </div>
          </div>

          <div className="report-stats">
            <div className="report-stat">
              <span>Total Units</span>
              <strong>{inventory.totalUnits}</strong>
            </div>

            <div className="report-stat">
              <span>Available Units</span>
              <strong>{inventory.availableUnits}</strong>
            </div>

            <div className="report-stat">
              <span>Issued Units</span>
              <strong>{inventory.issuedUnits}</strong>
            </div>

            <div className="report-stat">
              <span>Low-Stock Alerts</span>
              <strong style={{ color: "#b91c1c" }}>
                {inventory.lowStockItems}
              </strong>
            </div>
          </div>

          <div className="assets-table-container" style={{ marginTop: 20 }}>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Issued</th>
                  <th>Reorder Level</th>
                </tr>
              </thead>
              <tbody>
                {inventory.list.length > 0 ? (
                  inventory.list.map((i) => (
                    <tr key={i._id || i.id}>
                      <td>{i.name}</td>
                      <td>{i.category}</td>
                      <td>{i.total}</td>
                      <td>{i.available}</td>
                      <td>{i.issued}</td>
                      <td>{i.reorderLevel}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-assets">
                      No inventory records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3. MAINTENANCE SECTION */}
      {(reportFilter === "all" || reportFilter === "maintenance") && (
        <section className="report-section">
          <div className="report-section-header">
            <div>
              <h2>Maintenance Overview</h2>
              <p>Service records, active repairs, and cumulative costs</p>
            </div>
          </div>

          <div className="report-stats">
            <div className="report-stat">
              <span>Total Records</span>
              <strong>{maintenance.totalRecords}</strong>
            </div>

            <div className="report-stat">
              <span>Completed</span>
              <strong>{maintenance.completed}</strong>
            </div>

            <div className="report-stat">
              <span>In Progress</span>
              <strong>{maintenance.inProgress}</strong>
            </div>

            <div className="report-stat">
              <span>Scheduled</span>
              <strong>{maintenance.scheduled}</strong>
            </div>

            <div className="report-stat">
              <span>Cumulative Cost</span>
              <strong>₹{maintenance.totalCost.toLocaleString()}</strong>
            </div>
          </div>

          <div className="assets-table-container" style={{ marginTop: 20 }}>
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Technician</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.list.length > 0 ? (
                  maintenance.list.map((m) => (
                    <tr key={m._id || m.id}>
                      <td>{m.asset}</td>
                      <td>{m.type}</td>
                      <td>{m.technician}</td>
                      <td>
                        {m.date ? new Date(m.date).toLocaleDateString() : "N/A"}
                      </td>
                      <td>₹{Number(m.cost || 0).toLocaleString()}</td>
                      <td>
                        <span
                          className={`status ${m.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-assets">
                      No maintenance records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4. USAGE SECTION */}
      {(reportFilter === "all" || reportFilter === "usage") && (
        <section className="report-section">
          <div className="report-section-header">
            <div>
              <h2>Usage Overview</h2>
              <p>Equipment bookings and checkout utilization</p>
            </div>
          </div>

          <div className="report-stats">
            <div className="report-stat">
              <span>Total Logs</span>
              <strong>{usage.totalRecords}</strong>
            </div>

            <div className="report-stat">
              <span>Active Bookings</span>
              <strong>{usage.active}</strong>
            </div>

            <div className="report-stat">
              <span>Completed</span>
              <strong>{usage.completed}</strong>
            </div>

            <div className="report-stat">
              <span>Scheduled</span>
              <strong>{usage.scheduled}</strong>
            </div>
          </div>

          <div className="assets-table-container" style={{ marginTop: 20 }}>
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>User</th>
                  <th>Purpose</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usage.list.length > 0 ? (
                  usage.list.map((u) => (
                    <tr key={u._id || u.id}>
                      <td>{u.asset}</td>
                      <td>{u.user}</td>
                      <td>{u.purpose}</td>
                      <td>
                        {u.startDate
                          ? new Date(u.startDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        {u.endDate
                          ? new Date(u.endDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`status ${u.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-assets">
                      No usage records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}

export default Reports