import { useEffect, useState } from 'react'
import AddMaintenanceForm from '../components/AddMaintenanceForm'
import {
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
} from '../services/api'

function Maintenance() {
  const [maintenance, setMaintenance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [showForm, setShowForm] = useState(false)
  const [maintenanceToEdit, setMaintenanceToEdit] = useState(null)
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null)

  const fetchMaintenanceList = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMaintenance()
      setMaintenance(data)
    } catch (err) {
      console.error("Failed to fetch maintenance:", err)
      setError(err.message || "Failed to load maintenance records. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaintenanceList()
  }, [])

  const filteredMaintenance = maintenance.filter((record) => {
    const matchesSearch =
      record.asset?.toLowerCase().includes(search.toLowerCase()) ||
      record.technician?.toLowerCase().includes(search.toLowerCase()) ||
      record.type?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      record.status?.toLowerCase().replace(" ", "-") ===
        statusFilter.toLowerCase().replace(" ", "-")

    return matchesSearch && matchesStatus
  })

  const completedCount = maintenance.filter(
    (record) => record.status === "Completed"
  ).length

  const inProgressCount = maintenance.filter(
    (record) => record.status === "In Progress"
  ).length

  const scheduledCount = maintenance.filter(
    (record) => record.status === "Scheduled"
  ).length

  const totalCost = maintenance.reduce(
    (sum, record) => sum + (Number(record.cost) || 0),
    0
  )

  const handleAddMaintenance = async (newRecord) => {
    try {
      const created = await createMaintenance(newRecord)
      setMaintenance((prev) => [created, ...prev])
      setShowForm(false)
    } catch (err) {
      console.error("Failed to add maintenance record:", err)
      alert(err.message || "Failed to add maintenance record.")
    }
  }

  const handleEditMaintenance = (id) => {
    const record = maintenance.find((r) => (r._id || r.id) === id)
    if (record) {
      // Normalize date to YYYY-MM-DD for the HTML date input
      const dateStr = record.date ? new Date(record.date).toISOString().split('T')[0] : ''
      setMaintenanceToEdit({ ...record, date: dateStr })
      setShowForm(true)
    }
  }

  const handleSaveEdit = async (updatedRecord) => {
    try {
      const targetId = updatedRecord._id || updatedRecord.id
      const saved = await updateMaintenance(targetId, {
        asset: updatedRecord.asset,
        assetId: updatedRecord.assetId,
        type: updatedRecord.type,
        date: updatedRecord.date,
        technician: updatedRecord.technician,
        cost: updatedRecord.cost,
        status: updatedRecord.status
      })
      setMaintenance((prev) =>
        prev.map((r) => ((r._id || r.id) === targetId ? saved : r))
      )
      setMaintenanceToEdit(null)
      setShowForm(false)
    } catch (err) {
      console.error("Failed to update maintenance record:", err)
      alert(err.message || "Failed to update maintenance record.")
    }
  }

  const handleDeleteMaintenance = async (id) => {
    try {
      await deleteMaintenance(id)
      setMaintenance((prev) => prev.filter((r) => (r._id || r.id) !== id))
      setMaintenanceToDelete(null)
    } catch (err) {
      console.error("Failed to delete maintenance record:", err)
      alert(err.message || "Failed to delete maintenance record.")
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setMaintenanceToEdit(null)
  }

  return (
    <main className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Maintenance</h1>
          <p>Schedule repairs, track technician servicing, and monitor costs.</p>
        </div>

        <button
          className="add-asset-button"
          onClick={() => {
            setMaintenanceToEdit(null)
            setShowForm(true)
          }}
        >
          + Add Record
        </button>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards inventory-summary">
        <div className="card">
          <div className="card-top">
            <span className="card-icon">✓</span>
            <span className="card-label">Completed</span>
          </div>
          <h2>{completedCount}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">⚙</span>
            <span className="card-label">In Progress</span>
          </div>
          <h2>{inProgressCount}</h2>
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
            <span className="card-icon">💰</span>
            <span className="card-label">Total Cost</span>
          </div>
          <h2>₹{totalCost.toLocaleString()}</h2>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="asset-controls">
        <input
          type="text"
          placeholder="🔍 Search maintenance records..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Scheduled">Scheduled</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="assets-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading maintenance records from database...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">⚠️ {error}</p>
            <button className="retry-button" onClick={fetchMaintenanceList}>
              🔄 Try Again
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Date</th>
                <th>Technician</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMaintenance.length > 0 ? (
                filteredMaintenance.map((record) => {
                  const recordId = record._id || record.id
                  const formattedDate = record.date
                    ? new Date(record.date).toLocaleDateString()
                    : "N/A"

                  return (
                    <tr key={recordId}>
                      <td>{record.asset}</td>
                      <td>{record.type}</td>
                      <td>{formattedDate}</td>
                      <td>{record.technician}</td>
                      <td>₹{Number(record.cost || 0).toLocaleString()}</td>
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
                            onClick={() => handleEditMaintenance(recordId)}
                          >
                            ✏ Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => setMaintenanceToDelete(record)}
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
                    No maintenance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <AddMaintenanceForm
          onCancel={handleCloseForm}
          onAddMaintenance={
            maintenanceToEdit ? handleSaveEdit : handleAddMaintenance
          }
          maintenanceToEdit={maintenanceToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {maintenanceToDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete Maintenance Record?</h2>
            <p>
              Are you sure you want to delete maintenance record for
              <strong> {maintenanceToDelete.asset}</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone.</p>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setMaintenanceToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={() =>
                  handleDeleteMaintenance(
                    maintenanceToDelete._id || maintenanceToDelete.id
                  )
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

export default Maintenance