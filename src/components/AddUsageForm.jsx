import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAssets } from '../services/api'

function AddUsageForm({
  onCancel,
  onAddUsage,
  usageToEdit
}) {
  const [selectedAssetId, setSelectedAssetId] = useState(
    usageToEdit?.assetId || ""
  )
  const [asset, setAsset] = useState(
    usageToEdit ? usageToEdit.asset : ""
  )
  const [user, setUser] = useState(
    usageToEdit ? usageToEdit.user : ""
  )
  const [purpose, setPurpose] = useState(
    usageToEdit ? usageToEdit.purpose : ""
  )
  const [startDate, setStartDate] = useState(
    usageToEdit ? usageToEdit.startDate : ""
  )
  const [endDate, setEndDate] = useState(
    usageToEdit ? usageToEdit.endDate : ""
  )
  const [status, setStatus] = useState(
    usageToEdit ? usageToEdit.status : "Active"
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
      if (usageToEdit) {
        const match = list.find(
          (a) =>
            (usageToEdit.assetId && (a._id === usageToEdit.assetId || a.id === usageToEdit.assetId)) ||
            (usageToEdit.asset && a.name === usageToEdit.asset)
        )
        if (match) {
          setSelectedAssetId(match._id || match.id)
          setAsset(match.name)
        }
      }
    } catch (err) {
      console.error("Failed to fetch assets for usage form:", err)
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
      user.trim() === "" ||
      purpose.trim() === "" ||
      startDate === "" ||
      endDate === ""
    ) {
      setError("Please fill in all required fields.")
      return
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date.")
      return
    }

    const usageData = {
      asset: asset.trim(),
      assetId: selectedAssetId && selectedAssetId !== "legacy_asset" ? selectedAssetId : undefined,
      user: user.trim(),
      purpose: purpose.trim(),
      startDate,
      endDate,
      status
    }

    if (usageToEdit) {
      onAddUsage({
        ...usageToEdit,
        ...usageData
      })
    } else {
      onAddUsage(usageData)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="add-asset-modal">
        <div className="modal-header">
          <div>
            <h2>
              {usageToEdit ? "Edit Usage Record" : "Add Usage Record"}
            </h2>
            <p>
              {usageToEdit
                ? "Update the usage details."
                : "Enter the asset usage details."}
            </p>
          </div>
          <button className="close-button" onClick={onCancel}>
            ×
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="usage-asset">Asset</label>
            <select
              id="usage-asset"
              value={selectedAssetId}
              onChange={(event) => {
                const chosenId = event.target.value
                setSelectedAssetId(chosenId)
                const found = availableAssets.find((a) => (a._id || a.id) === chosenId)
                setAsset(found ? found.name : "")
                setError("")
              }}
              disabled={loadingAssets || (availableAssets.length === 0 && !usageToEdit)}
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
              ) : availableAssets.length === 0 && !usageToEdit ? (
                <option value="" disabled>
                  No assets available (Add an asset first)
                </option>
              ) : (
                <option value="">Select an asset</option>
              )}

              {/* Preserve existing asset if editing a record not present in current list */}
              {usageToEdit?.asset &&
                !availableAssets.some(
                  (a) =>
                    (usageToEdit.assetId && (a._id === usageToEdit.assetId || a.id === usageToEdit.assetId)) ||
                    a.name === usageToEdit.asset
                ) && (
                  <option value={selectedAssetId || "legacy_asset"}>
                    {usageToEdit.asset} (Current record)
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
              !usageToEdit && (
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
            <label htmlFor="usage-user">User</label>
            <input
              id="usage-user"
              type="text"
              placeholder="Enter user name"
              value={user}
              onChange={(event) => {
                setUser(event.target.value)
                setError("")
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="usage-purpose">Purpose</label>
            <input
              id="usage-purpose"
              type="text"
              placeholder="Enter usage purpose"
              value={purpose}
              onChange={(event) => {
                setPurpose(event.target.value)
                setError("")
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="usage-start-date">Start Date</label>
            <input
              id="usage-start-date"
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value)
                setError("")
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="usage-end-date">End Date</label>
            <input
              id="usage-end-date"
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value)
                setError("")
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="usage-status">Status</label>
            <select
              id="usage-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Scheduled">Scheduled</option>
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
                (availableAssets.length === 0 && !usageToEdit)
              }
            >
              {usageToEdit ? "Save Changes" : "Add Usage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddUsageForm
