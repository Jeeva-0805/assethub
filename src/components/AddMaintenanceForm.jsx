import { useState } from 'react'

function AddMaintenanceForm({
  onCancel,
  onAddMaintenance,
  maintenanceToEdit
}) {

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
    maintenanceToEdit
      ? maintenanceToEdit.status
      : "Scheduled"
  )

  const [error, setError] = useState("")


  const handleSubmit = (event) => {

    event.preventDefault()

    if (
      asset.trim() === "" ||
      date === "" ||
      technician.trim() === "" ||
      cost === ""
    ) {

      setError(
        "Please fill in all required fields."
      )

      return
    }


    if (Number(cost) < 0) {

      setError(
        "Cost cannot be negative."
      )

      return
    }


    const maintenanceData = {

      asset: asset.trim(),

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

      onAddMaintenance(
        maintenanceData
      )

    }

  }


  return (

    <div className="modal-overlay">

      <div className="add-asset-modal">

        <div className="modal-header">

          <div>

            <h2>

              {maintenanceToEdit
                ? "Edit Maintenance"
                : "Add Maintenance"}

            </h2>

            <p>

              {maintenanceToEdit
                ? "Update the maintenance details."
                : "Enter the maintenance record details."}

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

            <label>
              Asset
            </label>

            <select
              value={asset}
              onChange={(event) => {

                setAsset(event.target.value)
                setError("")

              }}
            >

              <option value="">
                Select asset
              </option>

              <option value="Dell Laptop">
                Dell Laptop
              </option>

              <option value="HP Printer">
                HP Printer
              </option>

              <option value="Projector">
                Projector
              </option>

              <option value="Arduino Uno">
                Arduino Uno
              </option>

            </select>

          </div>


          <div className="form-group">

            <label>
              Maintenance Type
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
            >

              <option value="Repair">
                Repair
              </option>

              <option value="Routine Service">
                Routine Service
              </option>

              <option value="Inspection">
                Inspection
              </option>

              <option value="Replacement">
                Replacement
              </option>

            </select>

          </div>


          <div className="form-group">

            <label>
              Maintenance Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) => {

                setDate(event.target.value)
                setError("")

              }}
            />

          </div>


          <div className="form-group">

            <label>
              Technician
            </label>

            <input
              type="text"
              placeholder="Enter technician name"
              value={technician}
              onChange={(event) => {

                setTechnician(
                  event.target.value
                )

                setError("")

              }}
            />

          </div>


          <div className="form-group">

            <label>
              Cost
            </label>

            <input
              type="number"
              min="0"
              placeholder="Enter maintenance cost"
              value={cost}
              onChange={(event) => {

                setCost(event.target.value)
                setError("")

              }}
            />

          </div>


          <div className="form-group">

            <label>
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >

              <option value="Scheduled">
                Scheduled
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>

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
            >

              {maintenanceToEdit
                ? "Save Changes"
                : "Add Maintenance"}

            </button>

          </div>

        </form>

      </div>

    </div>

  )
}

export default AddMaintenanceForm