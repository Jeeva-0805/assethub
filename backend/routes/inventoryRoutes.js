const express = require("express")
const router = express.Router()
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} = require("../controllers/inventoryController")
const { protect } = require("../middleware/authMiddleware")

router.use(protect)

router.get("/", getInventory)
router.get("/:id", getInventoryItem)
router.post("/", createInventoryItem)
router.put("/:id", updateInventoryItem)
router.delete("/:id", deleteInventoryItem)

module.exports = router
