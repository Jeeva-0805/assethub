const express = require("express")
const router = express.Router()
const {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset
} = require("../controllers/assetController")
const { protect } = require("../middleware/authMiddleware")

router.use(protect)

router.get("/", getAssets)
router.get("/:id", getAsset)
router.post("/", createAsset)
router.put("/:id", updateAsset)
router.delete("/:id", deleteAsset)

module.exports = router