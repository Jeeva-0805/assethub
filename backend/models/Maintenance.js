const mongoose = require("mongoose")

const maintenanceSchema = new mongoose.Schema(
  {
    asset: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true
    },
    type: {
      type: String,
      required: [true, "Maintenance type is required"],
      trim: true
    },
    date: {
      type: Date,
      required: [true, "Maintenance date is required"]
    },
    technician: {
      type: String,
      required: [true, "Technician name is required"],
      trim: true
    },
    cost: {
      type: Number,
      required: [true, "Maintenance cost is required"],
      min: [0, "Cost cannot be negative"]
    },
    status: {
      type: String,
      enum: {
        values: ["Scheduled", "In Progress", "Completed"],
        message: "Status must be Scheduled, In Progress, or Completed"
      },
      default: "Scheduled"
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("Maintenance", maintenanceSchema)