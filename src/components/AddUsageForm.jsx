import { useState } from 'react'

function AddUsageForm({
  onCancel,
  onAddUsage,
  usageToEdit
}) {

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
    usageToEdit
      ? usageToEdit.status
      : "Active"
  )

  const [error, setError] = useState("")


  const handleSubmit = (event) => {

    event.preventDefault()

    if (
      asset === "" ||
      user.trim() === "" ||
      purpose.trim() === "" ||
      startDate === "" ||
      endDate === ""
    ) {

      setError(
        "Please fill in all required fields."
      )

      return
    }


    if (endDate < startDate) {

      setError(
        "End date cannot be before start date."
      )

      return
    }


    const usageData = {

      asset,

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

              {usageToEdit
                ? "Edit Usage Record"
                : "Add Usage Record"}

            </h2>

            <p>

              {usageToEdit
                ? "Update the usage details."
                : "Enter the asset usage details."}

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
              User
            </label>

            <input
              type="text"
              placeholder="Enter user name"
              value={user}
              onChange={(event) => {

                setUser(event.target.value)
                setError("")

              }}
            />

          </div>


          <div className="form-group">

            <label>
              Purpose
            </label>

            <input
              type="text"
              placeholder="Enter usage purpose"
              value={purpose}
              onChange={(event) => {

                setPurpose(event.target.value)
                setError("")

              }}
            />

          </div>


          <div className="form-group">

            <label>
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) => {

                setStartDate(event.target.value)
                setError("")

              }}
            />

          </div>


          <div className="form-group">

            <label>
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) => {

                setEndDate(event.target.value)
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

              <option value="Active">
                Active
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Scheduled">
                Scheduled
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

              {usageToEdit
                ? "Save Changes"
                : "Add Usage"}

            </button>

          </div>

        </form>

      </div>

    </div>

  )
}

export default AddUsageForm