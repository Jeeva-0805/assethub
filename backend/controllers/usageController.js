const mongoose = require("mongoose")
const Usage = require("../models/Usage")
const Asset = require("../models/Asset")

// GET all usage records
const getUsage = async (req, res) => {
  try {
    const records = await Usage.find().sort({ startDate: -1, createdAt: -1 })
    return res.json(records)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch usage records",
      error: error.message
    })
  }
}

// GET single usage record
const getUsageRecord = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid usage record ID format" })
    }

    const record = await Usage.findById(req.params.id)
    if (!record) {
      return res.status(404).json({ message: "Usage record not found" })
    }

    return res.json(record)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch usage record",
      error: error.message
    })
  }
}

// POST create usage record
const createUsageRecord = async (req, res) => {
  try {
    let { asset, assetId, user, purpose, startDate, endDate, status } = req.body

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
    if (!user || !user.trim()) errors.push("User name is required")
    if (!purpose || !purpose.trim()) errors.push("Purpose is required")
    if (!startDate) errors.push("Start date is required")
    if (!endDate) errors.push("End date is required")

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end < start) {
        errors.push("End date cannot be before start date")
      }
    }

    const validStatuses = ["Active", "Completed", "Scheduled"]
    if (status && !validStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validStatuses.join(", ")}`)
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors
      })
    }

    const newRecord = await Usage.create({
      asset: asset.trim(),
      assetId: assetId || undefined,
      user: user.trim(),
      purpose: purpose.trim(),
      startDate,
      endDate,
      status: status || "Active"
    })

    return res.status(201).json(newRecord)
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create usage record",
      error: error.message
    })
  }
}

// PUT update usage record
const updateUsageRecord = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid usage record ID format" })
    }

    const existing = await Usage.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: "Usage record not found" })
    }

    let { asset, assetId, user, purpose, startDate, endDate, status } = req.body
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
    if (user !== undefined) updateData.user = user.trim()
    if (purpose !== undefined) updateData.purpose = purpose.trim()
    if (startDate !== undefined) updateData.startDate = startDate
    if (endDate !== undefined) updateData.endDate = endDate

    const finalStart = new Date(startDate !== undefined ? startDate : existing.startDate)
    const finalEnd = new Date(endDate !== undefined ? endDate : existing.endDate)
    if (finalEnd < finalStart) {
      return res.status(400).json({
        message: "Validation failed",
        errors: ["End date cannot be before start date"]
      })
    }

    if (status !== undefined) {
      const validStatuses = ["Active", "Completed", "Scheduled"]
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [`Status must be one of: ${validStatuses.join(", ")}`]
        })
      }
      updateData.status = status
    }

    const updatedRecord = await Usage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    return res.json(updatedRecord)
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update usage record",
      error: error.message
    })
  }
}

// DELETE usage record
const deleteUsageRecord = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid usage record ID format" })
    }

    const record = await Usage.findByIdAndDelete(req.params.id)
    if (!record) {
      return res.status(404).json({ message: "Usage record not found" })
    }

    return res.json({
      message: "Usage record deleted successfully",
      id: req.params.id
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete usage record",
      error: error.message
    })
  }
}

module.exports = {
  getUsage,
  getUsageRecord,
  createUsageRecord,
  updateUsageRecord,
  deleteUsageRecord
}
