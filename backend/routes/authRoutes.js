const express = require("express")
const router = express.Router()
const {
  getSetupStatus,
  setupInitialAdmin,
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authController")
const { protect } = require("../middleware/authMiddleware")

router.get("/setup-status", getSetupStatus)
router.post("/setup", setupInitialAdmin)
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/me", protect, getMe)

module.exports = router
