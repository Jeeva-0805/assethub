const mongoose = require("mongoose")

const usageSchema = new mongoose.Schema(
  {
    asset: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true
    },
    user: {
      type: String,
      required: [true, "User name is required"],
      trim: true
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"]
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          if (!this.startDate || !value) return true
          return new Date(value) >= new Date(this.startDate)
        },
        message: "End date cannot be before start date"
      }
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Completed", "Scheduled"],
        message: "Status must be Active, Completed, or Scheduled"
      },
      default: "Active"
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("Usage", usageSchema)