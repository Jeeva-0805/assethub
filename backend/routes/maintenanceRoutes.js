const express = require("express")
const router = express.Router()
const {
  getMaintenance,
  getMaintenanceRecord,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord
} = require("../controllers/maintenanceController")
const { protect } = require("../middleware/authMiddleware")

router.use(protect)

router.get("/", getMaintenance)
router.get("/:id", getMaintenanceRecord)
router.post("/", createMaintenanceRecord)
router.put("/:id", updateMaintenanceRecord)
router.delete("/:id", deleteMaintenanceRecord)

module.exports = router
