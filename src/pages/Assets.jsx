import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AddAssetForm from '../components/AddAssetForm'
import AssetQRModal from '../components/AssetQRModal'
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset
} from '../services/api'

function Assets() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [showForm, setShowForm] = useState(false)
  const [assetToEdit, setAssetToEdit] = useState(null)
  const [assetToDelete, setAssetToDelete] = useState(null)
  const [assetForQR, setAssetForQR] = useState(null)

  const fetchAssetsList = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAssets()
      setAssets(data)
    } catch (err) {
      console.error("Failed to fetch assets:", err)
      setError(err.message || "Failed to load assets. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssetsList()
  }, [])

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name?.toLowerCase().includes(search.toLowerCase()) ||
      asset.category?.toLowerCase().includes(search.toLowerCase()) ||
      asset.location?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      asset.status?.toLowerCase().replace(" ", "-") === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddAsset = async (newAsset) => {
    try {
      setActionError(null)
      const created = await createAsset(newAsset)
      setAssets((prev) => [created, ...prev])
      setShowForm(false)
    } catch (err) {
      console.error("Failed to create asset:", err)
      alert(err.message || "Failed to create asset.")
    }
  }

  const handleEditAsset = (id) => {
    const asset = assets.find((a) => (a._id || a.id) === id)
    setAssetToEdit(asset)
    setShowForm(true)
  }

  const handleSaveEdit = async (updatedAsset) => {
    try {
      setActionError(null)
      const targetId = updatedAsset._id || updatedAsset.id
      const saved = await updateAsset(targetId, {
        name: updatedAsset.name,
        category: updatedAsset.category,
        status: updatedAsset.status,
        location: updatedAsset.location
      })
      setAssets((prev) =>
        prev.map((a) => ((a._id || a.id) === targetId ? saved : a))
      )
      setAssetToEdit(null)
      setShowForm(false)
    } catch (err) {
      console.error("Failed to update asset:", err)
      alert(err.message || "Failed to update asset.")
    }
  }

  const handleDeleteAsset = async (id) => {
    try {
      setActionError(null)
      await deleteAsset(id)
      setAssets((prev) => prev.filter((a) => (a._id || a.id) !== id))
      setAssetToDelete(null)
    } catch (err) {
      console.error("Failed to delete asset:", err)
      alert(err.message || "Failed to delete asset.")
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setAssetToEdit(null)
    setActionError(null)
  }

  return (
    <main className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Assets</h1>
          <p>Manage all laboratory and institutional assets.</p>
        </div>

        <button
          className="add-asset-button"
          onClick={() => {
            setAssetToEdit(null)
            setShowForm(true)
          }}
        >
          + Add Asset
        </button>
      </div>

      {actionError && (
        <div className="form-error" style={{ marginBottom: 15 }}>
          {actionError}
        </div>
      )}

      {/* Search and Filter */}
      <div className="asset-controls">
        <input
          type="text"
          placeholder="🔍 Search assets..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Assets Table Container */}
      <div className="assets-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading assets from database...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">⚠️ {error}</p>
            <button className="retry-button" onClick={fetchAssetsList}>
              🔄 Try Again
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const assetId = asset._id || asset.id
                  return (
                    <tr key={assetId}>
                      <td>
                        <Link
                          to={`/assets/${assetId}`}
                          className="asset-table-link"
                          title="Click to view detailed asset profile and QR tag"
                        >
                          {asset.name}
                        </Link>
                      </td>
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
                      <td>
                        <div className="asset-actions">
                          <button
                            className="qr-button"
                            aria-label="View QR code"
                            title="View QR Tag"
                            onClick={() => setAssetForQR(asset)}
                          >
                            📱 QR
                          </button>

                          <button
                            className="edit-button"
                            onClick={() => handleEditAsset(assetId)}
                          >
                            ✏ Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => setAssetToDelete(asset)}
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
                  <td colSpan="5" className="no-assets">
                    No assets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <AddAssetForm
          onCancel={handleCloseForm}
          onAddAsset={assetToEdit ? handleSaveEdit : handleAddAsset}
          assetToEdit={assetToEdit}
        />
      )}

      {/* QR Code Modal */}
      {assetForQR && (
        <AssetQRModal
          asset={assetForQR}
          onClose={() => setAssetForQR(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete Asset?</h2>
            <p>
              Are you sure you want to delete
              <strong> {assetToDelete.name}</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone.</p>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setAssetToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={() => handleDeleteAsset(assetToDelete._id || assetToDelete.id)}
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Assets