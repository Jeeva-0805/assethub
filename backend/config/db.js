const mongoose = require("mongoose")
const User = require("../models/User")

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables.")
    }
    const dbName = process.env.DB_NAME || "assethub"
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName
    })
    console.log(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`)

    // Ensure all model indexes (including unique sparse index on isInitialAdmin) are built
    await User.init()
    console.log("Database indexes verified successfully.")
  } catch (error) {
    console.error("MongoDB connection failed:", error.message)
    process.exit(1)
  }
}

module.exports = connectDB