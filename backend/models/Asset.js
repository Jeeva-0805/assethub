const mongoose = require("mongoose")

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ["Available", "In Use", "Maintenance"],
        message: "Status must be Available, In Use, or Maintenance"
      },
      default: "Available"
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("Asset", assetSchema)
