const mongoose = require("mongoose")
const Asset = require("../models/Asset")

// GET all assets
const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 })
    return res.json(assets)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assets",
      error: error.message
    })
  }
}

// GET single asset by ID
const getAsset = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid asset ID format" })
    }

    const asset = await Asset.findById(req.params.id)
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" })
    }

    return res.json(asset)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch asset",
      error: error.message
    })
  }
}

// POST create new asset
const createAsset = async (req, res) => {
  try {
    const { name, category, status, location } = req.body

    if (!name || !category || !location) {
      return res.status(400).json({
        message: "Validation failed",
        errors: ["Name, category, and location are required fields"]
      })
    }

    const validStatuses = ["Available", "In Use", "Maintenance"]
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Validation failed",
        errors: [`Status must be one of: ${validStatuses.join(", ")}`]
      })
    }

    const asset = await Asset.create({
      name: name.trim(),
      category: category.trim(),
      status: status || "Available",
      location: location.trim()
    })

    return res.status(201).json(asset)
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create asset",
      error: error.message
    })
  }
}

// PUT update asset
const updateAsset = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid asset ID format" })
    }

    const { name, category, status, location } = req.body
    const updateData = {}

    if (name !== undefined) updateData.name = name.trim()
    if (category !== undefined) updateData.category = category.trim()
    if (location !== undefined) updateData.location = location.trim()

    if (status !== undefined) {
      const validStatuses = ["Available", "In Use", "Maintenance"]
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [`Status must be one of: ${validStatuses.join(", ")}`]
        })
      }
      updateData.status = status
    }

    const asset = await Asset.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" })
    }

    return res.json(asset)
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update asset",
      error: error.message
    })
  }
}

// DELETE asset
const deleteAsset = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid asset ID format" })
    }

    const asset = await Asset.findByIdAndDelete(req.params.id)
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" })
    }

    return res.json({
      message: "Asset deleted successfully",
      id: req.params.id
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete asset",
      error: error.message
    })
  }
}

module.exports = {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset
}