import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAssets } from '../services/api'

function AddMaintenanceForm({
  onCancel,
  onAddMaintenance,
  maintenanceToEdit
}) {
  const [selectedAssetId, setSelectedAssetId] = useState(
    maintenanceToEdit?.assetId || ""
  )
  const [asset, setAsset] = useState(
    maintenanceToEdit ? maintenanceToEdit.asset : ""
  )
  const [type, setType] = useState(
    maintenanceToEdit ? maintenanceToEdit.type : "Repair"
  )
  const [date, setDate] = useState(
    maintenanceToEdit ? maintenanceToEdit.date : ""
  )
  const [technician, setTechnician] = useState(
    maintenanceToEdit ? maintenanceToEdit.technician : ""
  )
  const [cost, setCost] = useState(
    maintenanceToEdit ? maintenanceToEdit.cost : ""
  )
  const [status, setStatus] = useState(
    maintenanceToEdit ? maintenanceToEdit.status : "Scheduled"
  )

  const [availableAssets, setAvailableAssets] = useState([])
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [assetError, setAssetError] = useState(null)
  const [error, setError] = useState("")

  const fetchAvailableAssets = async () => {
    try {
      setLoadingAssets(true)
      setAssetError(null)
      const data = await getAssets()
      const list = Array.isArray(data) ? data : []
      setAvailableAssets(list)

      // If editing or existing selection, match ID and name
      if (maintenanceToEdit) {
        const match = list.find(
          (a) =>
            (maintenanceToEdit.assetId && (a._id === maintenanceToEdit.assetId || a.id === maintenanceToEdit.assetId)) ||
            (maintenanceToEdit.asset && a.name === maintenanceToEdit.asset)
        )
        if (match) {
          setSelectedAssetId(match._id || match.id)
          setAsset(match.name)
        }
      }
    } catch (err) {
      console.error("Failed to fetch assets for maintenance form:", err)
      setAssetError(err.message || "Failed to load assets")
    } finally {
      setLoadingAssets(false)
    }
  }

  useEffect(() => {
    fetchAvailableAssets()
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (
      asset.trim() === "" ||
      date === "" ||
      technician.trim() === "" ||
      cost === ""
    ) {
      setError("Please fill in all required fields.")
      return
    }

    if (Number(cost) < 0) {
      setError("Cost cannot be negative.")
      return
    }

    const maintenanceData = {
      asset: asset.trim(),
      assetId: selectedAssetId && selectedAssetId !== "legacy_asset" ? selectedAssetId : undefined,
      type,
      date,
      technician: technician.trim(),
      cost: Number(cost),
      status
    }

    if (maintenanceToEdit) {
      onAddMaintenance({
        ...maintenanceToEdit,
        ...maintenanceData
      })
    } else {
      onAddMaintenance(maintenanceData)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="add-asset-modal">
        <div className="modal-header">
          <div>
            <h2>
              {maintenanceToEdit ? "Edit Maintenance" : "Add Maintenance"}
            </h2>
            <p>
              {maintenanceToEdit
                ? "Update the maintenance details."
                : "Enter the maintenance record details."}
            </p>
          </div>
          <button className="close-button" onClick={onCancel}>
            ×
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="maint-asset">Asset</label>
            <select
              id="maint-asset"
              value={selectedAssetId}
              onChange={(event) => {
                const chosenId = event.target.value
                setSelectedAssetId(chosenId)
                const found = availableAssets.find((a) => (a._id || a.id) === chosenId)
                setAsset(found ? found.name : "")
                setError("")
              }}
              disabled={loadingAssets || (availableAssets.length === 0 && !maintenanceToEdit)}
              required
            >
              {loadingAssets ? (
                <option value="" disabled>
                  Loading assets from database...
                </option>
              ) : assetError ? (
                <option value="" disabled>
                  Failed to load assets from server
                </option>
              ) : availableAssets.length === 0 && !maintenanceToEdit ? (
                <option value="" disabled>
                  No assets available (Add an asset first)
                </option>
              ) : (
                <option value="">Select an asset</option>
              )}

              {/* Preserve existing asset if editing a record not present in current list */}
              {maintenanceToEdit?.asset &&
                !availableAssets.some(
                  (a) =>
                    (maintenanceToEdit.assetId && (a._id === maintenanceToEdit.assetId || a.id === maintenanceToEdit.assetId)) ||
                    a.name === maintenanceToEdit.asset
                ) && (
                  <option value={selectedAssetId || "legacy_asset"}>
                    {maintenanceToEdit.asset} (Current record)
                  </option>
                )}

              {availableAssets.map((item) => (
                <option key={item._id || item.id} value={item._id || item.id}>
                  {item.name}
                  {item.location
                    ? ` (${item.location})`
                    : item.category
                    ? ` (${item.category})`
                    : ""}
                </option>
              ))}
            </select>

            {loadingAssets && (
              <small
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  marginTop: "4px",
                  display: "block"
                }}
              >
                Fetching registered assets...
              </small>
            )}

            {assetError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "#b91c1c"
                }}
              >
                <span>⚠️ {assetError}</span>
                <button
                  type="button"
                  onClick={fetchAvailableAssets}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    fontSize: "12px"
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingAssets &&
              !assetError &&
              availableAssets.length === 0 &&
              !maintenanceToEdit && (
                <small
                  style={{
                    color: "#b45309",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block"
                  }}
                >
                  ⚠️ No assets registered yet.{" "}
                  <Link
                    to="/assets"
                    style={{
                      color: "#2563eb",
                      fontWeight: 600,
                      textDecoration: "underline"
                    }}
                  >
                    Go to Assets page
                  </Link>{" "}
                  to create one first.
                </small>
              )}
          </div>

          <div className="form-group">
            <label htmlFor="maint-type">Maintenance Type</label>
            <select
              id="maint-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="Repair">Repair</option>
              <option value="Routine Service">Routine Service</option>
              <option value="Inspection">Inspection</option>
              <option value="Replacement">Replacement</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="maint-date">Maintenance Date</label>
            <input
              id="maint-date"
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                setError("")
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="maint-technician">Technician</label>
            <input
              id="maint-technician"
              type="text"
              placeholder="Enter technician name"
              value={technician}
              onChange={(event) => {
                setTechnician(event.target.value)
                setError("")
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="maint-cost">Cost</label>
            <input
              id="maint-cost"
              type="number"
              min="0"
              placeholder="Enter maintenance cost"
              value={cost}
              onChange={(event) => {
                setCost(event.target.value)
                setError("")
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="maint-status">Status</label>
            <select
              id="maint-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={
                loadingAssets ||
                (availableAssets.length === 0 && !maintenanceToEdit)
              }
            >
              {maintenanceToEdit ? "Save Changes" : "Add Maintenance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMaintenanceForm
