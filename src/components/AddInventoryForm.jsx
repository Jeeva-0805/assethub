import { useState } from 'react'

function AddInventoryForm({
  onCancel,
  onAddItem,
  itemToEdit
}) {

  const [name, setName] = useState(
    itemToEdit ? itemToEdit.name : ""
  )

  const [category, setCategory] = useState(
    itemToEdit ? itemToEdit.category : ""
  )

  const [total, setTotal] = useState(
    itemToEdit ? itemToEdit.total : ""
  )

  const [available, setAvailable] = useState(
    itemToEdit ? itemToEdit.available : ""
  )

  const [reorderLevel, setReorderLevel] = useState(
    itemToEdit ? itemToEdit.reorderLevel : ""
  )

  const [error, setError] = useState("")


  const handleSubmit = (event) => {

    event.preventDefault()

    if (
      name.trim() === "" ||
      category.trim() === "" ||
      total === "" ||
      available === "" ||
      reorderLevel === ""
    ) {

      setError(
        "Please fill in all required fields."
      )

      return
    }


    const totalQuantity = Number(total)
    const availableQuantity = Number(available)
    const reorderQuantity = Number(reorderLevel)


    if (
      totalQuantity <= 0 ||
      availableQuantity < 0 ||
      reorderQuantity < 0
    ) {

      setError(
        "Please enter valid quantity values."
      )

      return
    }


    if (
      availableQuantity > totalQuantity
    ) {

      setError(
        "Available quantity cannot be greater than total quantity."
      )

      return
    }


    if (
      reorderQuantity > totalQuantity
    ) {

      setError(
        "Reorder level cannot be greater than total quantity."
      )

      return
    }


    const issuedQuantity =
      totalQuantity - availableQuantity


    const inventoryData = {

      name: name.trim(),

      category: category.trim(),

      total: totalQuantity,

      available: availableQuantity,

      issued: issuedQuantity,

      reorderLevel: reorderQuantity

    }


    if (itemToEdit) {

      onAddItem({
        ...itemToEdit,
        ...inventoryData
      })

    } else {

      onAddItem(inventoryData)

    }

  }


  return (

    <div className="modal-overlay">

      <div className="add-asset-modal">

        <div className="modal-header">

          <div>

            <h2>

              {itemToEdit
                ? "Edit Inventory Item"
                : "Add Inventory Item"}

            </h2>

            <p>

              {itemToEdit
                ? "Update the inventory item details."
                : "Enter the details of the new inventory item."}

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
              Item Name
            </label>

            <input
              type="text"
              placeholder="Enter item name"
              value={name}
              onChange={(event) => {

                setName(event.target.value)
                setError("")

              }}
            />

          </div>


          <div className="form-group">

            <label>
              Category
            </label>

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

            <label>
              Total Quantity
            </label>

            <input
              type="number"
              min="1"
              placeholder="Enter total quantity"
              value={total}
              onChange={(event) => {

                setTotal(event.target.value)
                setError("")

              }}
            />

          </div>


          <div className="form-group">

            <label>
              Available Quantity
            </label>

            <input
              type="number"
              min="0"
              placeholder="Enter available quantity"
              value={available}
              onChange={(event) => {

                setAvailable(event.target.value)
                setError("")

              }}
            />

          </div>


          <div className="form-group">

            <label>
              Reorder Level
            </label>

            <input
              type="number"
              min="0"
              placeholder="Enter reorder level"
              value={reorderLevel}
              onChange={(event) => {

                setReorderLevel(event.target.value)
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

              {itemToEdit
                ? "Save Changes"
                : "Add Item"}

            </button>

          </div>


        </form>

      </div>

    </div>

  )
}

export default AddInventoryForm