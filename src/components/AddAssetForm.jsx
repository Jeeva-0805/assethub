import { useState } from 'react'

function AddAssetForm({
  onCancel,
  onAddAsset,
  assetToEdit
}) {

  const [name, setName] = useState(
    assetToEdit ? assetToEdit.name : ""
  )

  const [category, setCategory] = useState(
    assetToEdit ? assetToEdit.category : ""
  )

  const [status, setStatus] = useState(
    assetToEdit ? assetToEdit.status : "Available"
  )

  const [location, setLocation] = useState(
    assetToEdit ? assetToEdit.location : ""
  )

  const [error, setError] = useState("")


  const handleSubmit = (event) => {

    event.preventDefault()

    if (
      name.trim() === "" ||
      category.trim() === "" ||
      location.trim() === ""
    ) {
      setError("Please fill in all required fields.")
      return
    }

    const assetData = {
      name: name.trim(),
      category: category.trim(),
      status: status,
      location: location.trim()
    }

    if (assetToEdit) {

      onAddAsset({
        ...assetToEdit,
        ...assetData
      })

    } else {

      onAddAsset(assetData)

    }
  }


  return (
    <div className="modal-overlay">

      <div className="add-asset-modal">

        <div className="modal-header">

          <div>

            <h2>
              {assetToEdit
                ? "Edit Asset"
                : "Add New Asset"}
            </h2>

            <p>
              {assetToEdit
                ? "Update the asset details."
                : "Enter the details of the new asset."}
            </p>

          </div>


          <button
            className="close-button"
            onClick={onCancel}
          >
            ×
          </button>

        </div>


        {error && (
          <p className="form-error">
            {error}
          </p>
        )}


        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Asset Name</label>

            <input
              type="text"
              placeholder="Enter asset name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError("")
              }}
            />

          </div>


          <div className="form-group">

            <label>Category</label>

            <input
              type="text"
              placeholder="Enter category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                setError("")
              }}
            />

          </div>


          <div className="form-group">

            <label>Status</label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >

              <option value="Available">
                Available
              </option>

              <option value="In Use">
                In Use
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

            </select>

          </div>


          <div className="form-group">

            <label>Location</label>

            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value)
                setError("")
              }}
            />

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
            >
              {assetToEdit
                ? "Save Changes"
                : "Add Asset"}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default AddAssetForm