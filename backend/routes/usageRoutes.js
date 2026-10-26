const express = require("express")
const router = express.Router()
const {
  getUsage,
  getUsageRecord,
  createUsageRecord,
  updateUsageRecord,
  deleteUsageRecord
} = require("../controllers/usageController")
const { protect } = require("../middleware/authMiddleware")

router.use(protect)

router.get("/", getUsage)
router.get("/:id", getUsageRecord)
router.post("/", createUsageRecord)
router.put("/:id", updateUsageRecord)
router.delete("/:id", deleteUsageRecord)

module.exports = router
