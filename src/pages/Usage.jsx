import { useEffect, useState } from 'react'
import AddUsageForm from '../components/AddUsageForm'
import {
  getUsage,
  createUsage,
  updateUsage,
  deleteUsage
} from '../services/api'

function Usage() {
  const [usageRecords, setUsageRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [showForm, setShowForm] = useState(false)
  const [usageToEdit, setUsageToEdit] = useState(null)
  const [usageToDelete, setUsageToDelete] = useState(null)

  const fetchUsageList = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsage()
      setUsageRecords(data)
    } catch (err) {
      console.error("Failed to fetch usage:", err)
      setError(err.message || "Failed to load usage records. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsageList()
  }, [])

  const filteredUsage = usageRecords.filter((record) => {
    const matchesSearch =
      record.asset?.toLowerCase().includes(search.toLowerCase()) ||
      record.user?.toLowerCase().includes(search.toLowerCase()) ||
      record.purpose?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      record.status?.toLowerCase().replace(" ", "-") ===
        statusFilter.toLowerCase().replace(" ", "-")

    return matchesSearch && matchesStatus
  })

  const activeCount = usageRecords.filter(
    (record) => record.status === "Active"
  ).length

  const completedCount = usageRecords.filter(
    (record) => record.status === "Completed"
  ).length

  const scheduledCount = usageRecords.filter(
    (record) => record.status === "Scheduled"
  ).length

  const handleAddUsage = async (newUsage) => {
    try {
      const created = await createUsage(newUsage)
      setUsageRecords((prev) => [created, ...prev])
      setShowForm(false)
    } catch (err) {
      console.error("Failed to add usage record:", err)
      alert(err.message || "Failed to add usage record.")
    }
  }

  const handleEditUsage = (id) => {
    const record = usageRecords.find((r) => (r._id || r.id) === id)
    if (record) {
      // Normalize dates to YYYY-MM-DD for date inputs
      const startStr = record.startDate
        ? new Date(record.startDate).toISOString().split('T')[0]
        : ''
      const endStr = record.endDate
        ? new Date(record.endDate).toISOString().split('T')[0]
        : ''

      setUsageToEdit({
        ...record,
        startDate: startStr,
        endDate: endStr
      })
      setShowForm(true)
    }
  }

  const handleSaveEdit = async (updatedUsage) => {
    try {
      const targetId = updatedUsage._id || updatedUsage.id
      const saved = await updateUsage(targetId, {
        asset: updatedUsage.asset,
        user: updatedUsage.user,
        purpose: updatedUsage.purpose,
        startDate: updatedUsage.startDate,
        endDate: updatedUsage.endDate,
        status: updatedUsage.status
      })
      setUsageRecords((prev) =>
        prev.map((r) => ((r._id || r.id) === targetId ? saved : r))
      )
      setUsageToEdit(null)
      setShowForm(false)
    } catch (err) {
      console.error("Failed to update usage record:", err)
      alert(err.message || "Failed to update usage record.")
    }
  }

  const handleDeleteUsage = async (id) => {
    try {
      await deleteUsage(id)
      setUsageRecords((prev) => prev.filter((r) => (r._id || r.id) !== id))
      setUsageToDelete(null)
    } catch (err) {
      console.error("Failed to delete usage record:", err)
      alert(err.message || "Failed to delete usage record.")
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setUsageToEdit(null)
  }

  return (
    <main className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Usage</h1>
          <p>Track laboratory equipment checkouts, user logs, and return schedules.</p>
        </div>

        <button
          className="add-asset-button"
          onClick={() => {
            setUsageToEdit(null)
            setShowForm(true)
          }}
        >
          + Add Usage
        </button>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards inventory-summary">
        <div className="card">
          <div className="card-top">
            <span className="card-icon">⚡</span>
            <span className="card-label">Active Checkouts</span>
          </div>
          <h2>{activeCount}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">✓</span>
            <span className="card-label">Completed</span>
          </div>
          <h2>{completedCount}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">📅</span>
            <span className="card-label">Scheduled</span>
          </div>
          <h2>{scheduledCount}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">🔄</span>
            <span className="card-label">Total Records</span>
          </div>
          <h2>{usageRecords.length}</h2>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="asset-controls">
        <input
          type="text"
          placeholder="🔍 Search by asset, user, or purpose..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Scheduled">Scheduled</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="assets-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading usage logs from database...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">⚠️ {error}</p>
            <button className="retry-button" onClick={fetchUsageList}>
              🔄 Try Again
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>User</th>
                <th>Purpose</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsage.length > 0 ? (
                filteredUsage.map((record) => {
                  const recordId = record._id || record.id
                  const startStr = record.startDate
                    ? new Date(record.startDate).toLocaleDateString()
                    : "N/A"
                  const endStr = record.endDate
                    ? new Date(record.endDate).toLocaleDateString()
                    : "N/A"

                  return (
                    <tr key={recordId}>
                      <td>{record.asset}</td>
                      <td>{record.user}</td>
                      <td>{record.purpose}</td>
                      <td>{startStr}</td>
                      <td>{endStr}</td>
                      <td>
                        <span
                          className={`status ${record.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td>
                        <div className="asset-actions">
                          <button
                            className="edit-button"
                            onClick={() => handleEditUsage(recordId)}
                          >
                            ✏ Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => setUsageToDelete(record)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-assets">
                    No usage records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <AddUsageForm
          onCancel={handleCloseForm}
          onAddUsage={usageToEdit ? handleSaveEdit : handleAddUsage}
          usageToEdit={usageToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {usageToDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete Usage Record?</h2>
            <p>
              Are you sure you want to delete the usage record for
              <strong> {usageToDelete.asset}</strong> by{" "}
              <strong>{usageToDelete.user}</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone.</p>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setUsageToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={() =>
                  handleDeleteUsage(usageToDelete._id || usageToDelete.id)
                }
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Usage