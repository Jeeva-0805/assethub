const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongoose = require("mongoose")

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const assetRoutes = require("./routes/assetRoutes")
const inventoryRoutes = require("./routes/inventoryRoutes")
const maintenanceRoutes = require("./routes/maintenanceRoutes")
const usageRoutes = require("./routes/usageRoutes")
const reportRoutes = require("./routes/reportRoutes")

dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://assethub-gamma.vercel.app",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, "")] : [])
]

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(null, true) // Allow during dev / fallback
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

app.use(express.json())

// Health check endpoint
app.get("/", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1
  res.json({
    status: "online",
    message: "AssetHub Backend is running!",
    database: {
      status: isDbConnected ? "connected" : "disconnected",
      name: mongoose.connection.name || null
    }
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/assets", assetRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/maintenance", maintenanceRoutes)
app.use("/api/usage", usageRoutes)
app.use("/api/reports", reportRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` })
})

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack)
  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})