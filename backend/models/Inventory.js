const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true
    },
    total: {
      type: Number,
      required: [true, "Total quantity is required"],
      min: [1, "Total quantity must be greater than 0"]
    },
    available: {
      type: Number,
      required: [true, "Available quantity is required"],
      min: [0, "Available quantity cannot be negative"],
      validate: {
        validator: function (value) {
          if (typeof this.total === "number") {
            return value <= this.total
          }
          return true
        },
        message: "Available quantity cannot exceed total quantity"
      }
    },
    issued: {
      type: Number,
      required: true,
      min: [0, "Issued quantity cannot be negative"]
    },
    reorderLevel: {
      type: Number,
      required: [true, "Reorder level is required"],
      min: [0, "Reorder level cannot be negative"],
      validate: {
        validator: function (value) {
          if (typeof this.total === "number") {
            return value <= this.total
          }
          return true
        },
        message: "Reorder level cannot exceed total quantity"
      }
    }
  },
  {
    timestamps: true
  }
)

// Ensure issued is always total - available before validation / saving
inventorySchema.pre("validate", function () {
  if (typeof this.total === "number" && typeof this.available === "number") {
    this.issued = Math.max(0, this.total - this.available)
  }
})

module.exports = mongoose.model("Inventory", inventorySchema)