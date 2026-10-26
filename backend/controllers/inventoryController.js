const mongoose = require("mongoose")
const Inventory = require("../models/Inventory")

// GET all inventory items
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 })
    return res.json(items)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch inventory items",
      error: error.message
    })
  }
}

// GET single inventory item
const getInventoryItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid inventory item ID format" })
    }

    const item = await Inventory.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" })
    }

    return res.json(item)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch inventory item",
      error: error.message
    })
  }
}

// POST create inventory item
const createInventoryItem = async (req, res) => {
  try {
    const { name, category, total, available, reorderLevel } = req.body

    const errors = []
    if (!name || !name.trim()) errors.push("Item name is required")
    if (!category || !category.trim()) errors.push("Category is required")

    const totalNum = Number(total)
    const availableNum = Number(available)
    const reorderNum = Number(reorderLevel)

    if (isNaN(totalNum) || totalNum <= 0) {
      errors.push("Total quantity must be a number greater than 0")
    }
    if (isNaN(availableNum) || availableNum < 0) {
      errors.push("Available quantity must be a non-negative number")
    }
    if (isNaN(reorderNum) || reorderNum < 0) {
      errors.push("Reorder level must be a non-negative number")
    }

    if (availableNum > totalNum) {
      errors.push("Available quantity cannot exceed total quantity")
    }
    if (reorderNum > totalNum) {
      errors.push("Reorder level cannot exceed total quantity")
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors
      })
    }

    const issuedNum = totalNum - availableNum

    const newItem = await Inventory.create({
      name: name.trim(),
      category: category.trim(),
      total: totalNum,
      available: availableNum,
      issued: issuedNum,
      reorderLevel: reorderNum
    })

    return res.status(201).json(newItem)
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create inventory item",
      error: error.message
    })
  }
}

// PUT update inventory item
const updateInventoryItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid inventory item ID format" })
    }

    const existing = await Inventory.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: "Inventory item not found" })
    }

    const { name, category, total, available, reorderLevel } = req.body

    const totalNum = total !== undefined ? Number(total) : existing.total
    const availableNum = available !== undefined ? Number(available) : existing.available
    const reorderNum = reorderLevel !== undefined ? Number(reorderLevel) : existing.reorderLevel

    const errors = []
    if (isNaN(totalNum) || totalNum <= 0) {
      errors.push("Total quantity must be a number greater than 0")
    }
    if (isNaN(availableNum) || availableNum < 0) {
      errors.push("Available quantity must be a non-negative number")
    }
    if (isNaN(reorderNum) || reorderNum < 0) {
      errors.push("Reorder level must be a non-negative number")
    }
    if (availableNum > totalNum) {
      errors.push("Available quantity cannot exceed total quantity")
    }
    if (reorderNum > totalNum) {
      errors.push("Reorder level cannot exceed total quantity")
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors
      })
    }

    if (name !== undefined) existing.name = name.trim()
    if (category !== undefined) existing.category = category.trim()
    existing.total = totalNum
    existing.available = availableNum
    existing.issued = totalNum - availableNum
    existing.reorderLevel = reorderNum

    const updatedItem = await existing.save()

    return res.json(updatedItem)
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update inventory item",
      error: error.message
    })
  }
}

// DELETE inventory item
const deleteInventoryItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid inventory item ID format" })
    }

    const item = await Inventory.findByIdAndDelete(req.params.id)
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" })
    }

    return res.json({
      message: "Inventory item deleted successfully",
      id: req.params.id
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete inventory item",
      error: error.message
    })
  }
}

module.exports = {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
}
