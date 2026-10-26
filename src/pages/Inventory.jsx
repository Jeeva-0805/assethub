import { useEffect, useState } from 'react'
import AddInventoryForm from '../components/AddInventoryForm'
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory
} from '../services/api'

function Inventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [showForm, setShowForm] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)

  const fetchInventoryList = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getInventory()
      setInventory(data)
    } catch (err) {
      console.error("Failed to fetch inventory:", err)
      setError(err.message || "Failed to load inventory. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryList()
  }, [])

  // Dynamic unique categories for the dropdown filter
  const categories = [
    "all",
    ...new Set(inventory.map((item) => item.category).filter(Boolean))
  ]

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const totalItems = inventory.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  )

  const totalAvailable = inventory.reduce(
    (sum, item) => sum + (Number(item.available) || 0),
    0
  )

  const totalIssued = inventory.reduce(
    (sum, item) => sum + (Number(item.issued) || 0),
    0
  )

  const lowStockItems = inventory.filter(
    (item) => Number(item.available) <= Number(item.reorderLevel)
  ).length

  const handleAddItem = async (newItem) => {
    try {
      const created = await createInventory(newItem)
      setInventory((prev) => [created, ...prev])
      setShowForm(false)
    } catch (err) {
      console.error("Failed to add inventory item:", err)
      alert(err.message || "Failed to add inventory item.")
    }
  }

  const handleEditItem = (id) => {
    const item = inventory.find((i) => (i._id || i.id) === id)
    setItemToEdit(item)
    setShowForm(true)
  }

  const handleSaveEdit = async (updatedItem) => {
    try {
      const targetId = updatedItem._id || updatedItem.id
      const saved = await updateInventory(targetId, {
        name: updatedItem.name,
        category: updatedItem.category,
        total: updatedItem.total,
        available: updatedItem.available,
        reorderLevel: updatedItem.reorderLevel
      })
      setInventory((prev) =>
        prev.map((i) => ((i._id || i.id) === targetId ? saved : i))
      )
      setItemToEdit(null)
      setShowForm(false)
    } catch (err) {
      console.error("Failed to update inventory item:", err)
      alert(err.message || "Failed to update inventory item.")
    }
  }

  const handleDeleteItem = async (id) => {
    try {
      await deleteInventory(id)
      setInventory((prev) => prev.filter((i) => (i._id || i.id) !== id))
      setItemToDelete(null)
    } catch (err) {
      console.error("Failed to delete inventory item:", err)
      alert(err.message || "Failed to delete inventory item.")
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setItemToEdit(null)
  }

  return (
    <main className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Track consumable supplies, equipment stock, and reorder levels.</p>
        </div>

        <button
          className="add-asset-button"
          onClick={() => {
            setItemToEdit(null)
            setShowForm(true)
          }}
        >
          + Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards inventory-summary">
        <div className="card">
          <div className="card-top">
            <span className="card-icon">📋</span>
            <span className="card-label">Total Units</span>
          </div>
          <h2>{totalItems}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">✓</span>
            <span className="card-label">Available Units</span>
          </div>
          <h2>{totalAvailable}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">↗</span>
            <span className="card-label">Issued Units</span>
          </div>
          <h2>{totalIssued}</h2>
        </div>

        <div className="card">
          <div className="card-top">
            <span className="card-icon">⚠️</span>
            <span className="card-label">Low Stock Items</span>
          </div>
          <h2 className="inventory-low-stock">{lowStockItems}</h2>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="asset-controls">
        <input
          type="text"
          placeholder="🔍 Search inventory..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table Container */}
      <div className="assets-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading inventory from database...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">⚠️ {error}</p>
            <button className="retry-button" onClick={fetchInventoryList}>
              🔄 Try Again
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Total</th>
                <th>Available</th>
                <th>Issued</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const itemId = item._id || item.id
                  const isLowStock =
                    Number(item.available) <= Number(item.reorderLevel)

                  return (
                    <tr key={itemId}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.total}</td>
                      <td>{item.available}</td>
                      <td>{item.issued}</td>
                      <td>{item.reorderLevel}</td>
                      <td>
                        {isLowStock ? (
                          <span className="status maintenance">Low Stock</span>
                        ) : (
                          <span className="status available">In Stock</span>
                        )}
                      </td>
                      <td>
                        <div className="asset-actions">
                          <button
                            className="edit-button"
                            onClick={() => handleEditItem(itemId)}
                          >
                            ✏ Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => setItemToDelete(item)}
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
                  <td colSpan="8" className="no-assets">
                    No inventory items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <AddInventoryForm
          onCancel={handleCloseForm}
          onAddItem={itemToEdit ? handleSaveEdit : handleAddItem}
          itemToEdit={itemToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete Inventory Item?</h2>
            <p>
              Are you sure you want to delete
              <strong> {itemToDelete.name}</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone.</p>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={() => handleDeleteItem(itemToDelete._id || itemToDelete.id)}
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Inventory