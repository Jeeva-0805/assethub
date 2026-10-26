const Asset = require("../models/Asset")
const Inventory = require("../models/Inventory")
const Maintenance = require("../models/Maintenance")
const Usage = require("../models/Usage")

// GET summary of all modules
const getReportSummary = async (req, res) => {
  try {
    const [assets, inventory, maintenance, usage] = await Promise.all([
      Asset.find().sort({ createdAt: -1 }),
      Inventory.find().sort({ createdAt: -1 }),
      Maintenance.find().sort({ date: -1 }),
      Usage.find().sort({ startDate: -1 })
    ])

    // Asset calculations
    const totalAssets = assets.length
    const availableAssets = assets.filter((a) => a.status === "Available").length
    const inUseAssets = assets.filter((a) => a.status === "In Use").length
    const maintenanceAssets = assets.filter((a) => a.status === "Maintenance").length

    // Inventory calculations
    const totalInventoryUnits = inventory.reduce((sum, item) => sum + (item.total || 0), 0)
    const availableInventoryUnits = inventory.reduce((sum, item) => sum + (item.available || 0), 0)
    const issuedInventoryUnits = inventory.reduce((sum, item) => sum + (item.issued || 0), 0)
    const lowStockItems = inventory.filter((item) => item.available <= item.reorderLevel).length

    // Maintenance calculations
    const totalMaintenanceRecords = maintenance.length
    const completedMaintenance = maintenance.filter((m) => m.status === "Completed").length
    const inProgressMaintenance = maintenance.filter((m) => m.status === "In Progress").length
    const scheduledMaintenance = maintenance.filter((m) => m.status === "Scheduled").length
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0)

    // Usage calculations
    const totalUsageRecords = usage.length
    const activeUsage = usage.filter((u) => u.status === "Active").length
    const completedUsage = usage.filter((u) => u.status === "Completed").length
    const scheduledUsage = usage.filter((u) => u.status === "Scheduled").length

    return res.json({
      asset: {
        total: totalAssets,
        available: availableAssets,
        inUse: inUseAssets,
        maintenance: maintenanceAssets,
        list: assets
      },
      inventory: {
        totalUnits: totalInventoryUnits,
        availableUnits: availableInventoryUnits,
        issuedUnits: issuedInventoryUnits,
        lowStockItems,
        totalItemsCount: inventory.length,
        list: inventory
      },
      maintenance: {
        totalRecords: totalMaintenanceRecords,
        completed: completedMaintenance,
        inProgress: inProgressMaintenance,
        scheduled: scheduledMaintenance,
        totalCost: totalMaintenanceCost,
        list: maintenance
      },
      usage: {
        totalRecords: totalUsageRecords,
        active: activeUsage,
        completed: completedUsage,
        scheduled: scheduledUsage,
        list: usage
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate report summary",
      error: error.message
    })
  }
}

module.exports = {
  getReportSummary
}
