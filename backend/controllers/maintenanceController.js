const mongoose = require("mongoose")
const Maintenance = require("../models/Maintenance")
const Asset = require("../models/Asset")

// GET all maintenance records
const getMaintenance = async (req, res) => {
  try {
    const records = await Maintenance.find().sort({ date: -1, createdAt: -1 })
    return res.json(records)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch maintenance records",
      error: error.message
    })
  }
}

// GET single maintenance record
const getMaintenanceRecord = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid maintenance record ID format" })
    }

    const record = await Maintenance.findById(req.params.id)
    if (!record) {
      return res.status(404).json({ message: "Maintenance record not found" })
    }

    return res.json(record)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch maintenance record",
      error: error.message
    })
  }
}

// POST create maintenance record
const createMaintenanceRecord = async (req, res) => {
  try {
    let { asset, assetId, type, date, technician, cost, status } = req.body

    // Resolve asset name if assetId was provided or if asset is an ObjectId
    if (!asset && assetId) {
      if (mongoose.Types.ObjectId.isValid(assetId)) {
        const found = await Asset.findById(assetId)
        if (found) {
          asset = found.name
        }
      }
    } else if (asset && mongoose.Types.ObjectId.isValid(asset)) {
      const found = await Asset.findById(asset)
      if (found) {
        assetId = asset
        asset = found.name
      }
    } else if (asset && !assetId) {
      const found = await Asset.findOne({ name: asset.trim() })
      if (found) {
        assetId = found._id
      }
    }

    const errors = []
    if (!asset || !asset.trim()) errors.push("Asset name is required")
    if (!type || !type.trim()) errors.push("Maintenance type is required")
    if (!date) errors.push("Maintenance date is required")
    if (!technician || !technician.trim()) errors.push("Technician name is required")

    const costNum = Number(cost)
    if (cost === undefined || cost === null || isNaN(costNum) || costNum < 0) {
      errors.push("Maintenance cost must be a non-negative number")
    }

    const validStatuses = ["Scheduled", "In Progress", "Completed"]
    if (status && !validStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validStatuses.join(", ")}`)
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors
      })
    }

    const newRecord = await Maintenance.create({
      asset: asset.trim(),
      assetId: assetId || undefined,
      type: type.trim(),
      date,
      technician: technician.trim(),
      cost: costNum,
      status: status || "Scheduled"
    })

    return res.status(201).json(newRecord)
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create maintenance record",
      error: error.message
    })
  }
}

// PUT update maintenance record
const updateMaintenanceRecord = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid maintenance record ID format" })
    }

    let { asset, assetId, type, date, technician, cost, status } = req.body
    const updateData = {}

    if (!asset && assetId) {
      if (mongoose.Types.ObjectId.isValid(assetId)) {
        const found = await Asset.findById(assetId)
        if (found) {
          asset = found.name
        }
      }
    } else if (asset && mongoose.Types.ObjectId.isValid(asset)) {
      const found = await Asset.findById(asset)
      if (found) {
        assetId = asset
        asset = found.name
      }
    } else if (asset && !assetId) {
      const found = await Asset.findOne({ name: asset.trim() })
      if (found) {
        assetId = found._id
      }
    }

    if (asset !== undefined) updateData.asset = asset.trim()
    if (assetId !== undefined) updateData.assetId = assetId
    if (type !== undefined) updateData.type = type.trim()
    if (date !== undefined) updateData.date = date
    if (technician !== undefined) updateData.technician = technician.trim()

    if (cost !== undefined) {
      const costNum = Number(cost)
      if (isNaN(costNum) || costNum < 0) {
        return res.status(400).json({
          message: "Validation failed",
          errors: ["Cost must be a non-negative number"]
        })
      }
      updateData.cost = costNum
    }

    if (status !== undefined) {
      const validStatuses = ["Scheduled", "In Progress", "Completed"]
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [`Status must be one of: ${validStatuses.join(", ")}`]
        })
      }
      updateData.status = status
    }

    const updatedRecord = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedRecord) {
      return res.status(404).json({ message: "Maintenance record not found" })
    }

    return res.json(updatedRecord)
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update maintenance record",
      error: error.message
    })
  }
}

// DELETE maintenance record
const deleteMaintenanceRecord = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid maintenance record ID format" })
    }

    const record = await Maintenance.findByIdAndDelete(req.params.id)
    if (!record) {
      return res.status(404).json({ message: "Maintenance record not found" })
    }

    return res.json({
      message: "Maintenance record deleted successfully",
      id: req.params.id
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete maintenance record",
      error: error.message
    })
  }
}

module.exports = {
  getMaintenance,
  getMaintenanceRecord,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord
}
