const mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("./models/User")
const Asset = require("./models/Asset")
const Inventory = require("./models/Inventory")
const Maintenance = require("./models/Maintenance")
const Usage = require("./models/Usage")

dotenv.config()

const seedData = async () => {
  try {
    // Production safeguard: Block seeding in production unless explicitly authorized
    if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED_IN_PRODUCTION) {
      console.error("CRITICAL SAFETY BLOCK: Database seeding is disabled in production environment.")
      console.error("To override, define ALLOW_SEED_IN_PRODUCTION=true in your environment variables.")
      process.exit(1)
    }

    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/assethub"
    console.log(`Connecting to MongoDB at: ${mongoUri}`)
    await mongoose.connect(mongoUri)
    console.log("Connected successfully. Seeding database...")

    // Clear existing data to avoid duplicates
    await User.deleteMany({})
    await Asset.deleteMany({})
    await Inventory.deleteMany({})
    await Maintenance.deleteMany({})
    await Usage.deleteMany({})

    // 1. Seed Users
    const users = await User.create([
      {
        name: "Administrator",
        email: "admin@assethub.com",
        password: "admin123", // Will be hashed by pre-save hook
        role: "Admin"
      },
      {
        name: "Lab Manager",
        email: "manager@assethub.com",
        password: "manager123", // Will be hashed by pre-save hook
        role: "Lab Manager"
      }
    ])
    console.log(`✓ Seeded ${users.length} users (Admin: admin@assethub.com / admin123)`)

    // 2. Seed Assets
    const assets = await Asset.create([
      {
        name: "Dell XPS Laptop",
        category: "Computer",
        status: "Available",
        location: "Computer Lab 1"
      },
      {
        name: "HP LaserJet Pro",
        category: "Printer",
        status: "In Use",
        location: "Faculty Office"
      },
      {
        name: "Epson 4K Projector",
        category: "Electronics",
        status: "Maintenance",
        location: "Seminar Hall 2"
      },
      {
        name: "Arduino Uno Rev3",
        category: "Development Board",
        status: "Available",
        location: "IoT & Embedded Lab"
      },
      {
        name: "Olympus Binocular Microscope",
        category: "Laboratory Equipment",
        status: "In Use",
        location: "Biology Lab 3"
      },
      {
        name: "Rigol Digital Oscilloscope",
        category: "Electronics Testing",
        status: "Available",
        location: "Circuits & VLSI Lab"
      }
    ])
    console.log(`✓ Seeded ${assets.length} assets`)

    // 3. Seed Inventory Items
    const inventory = await Inventory.create([
      {
        name: "HDMI Cable 2m",
        category: "Accessories",
        total: 25,
        available: 18,
        issued: 7,
        reorderLevel: 5
      },
      {
        name: "USB Keyboard",
        category: "Peripherals",
        total: 20,
        available: 4,
        issued: 16,
        reorderLevel: 6 // Low stock condition: available (4) <= reorderLevel (6)
      },
      {
        name: "Arduino Uno SMD",
        category: "Development Board",
        total: 15,
        available: 10,
        issued: 5,
        reorderLevel: 4
      },
      {
        name: "Cat6 Ethernet Cable 5m",
        category: "Networking",
        total: 35,
        available: 28,
        issued: 7,
        reorderLevel: 10
      },
      {
        name: "Digital Multimeter Probes",
        category: "Testing Tools",
        total: 12,
        available: 3,
        issued: 9,
        reorderLevel: 4 // Low stock condition
      },
      {
        name: "Breadboard 830 Points",
        category: "Components",
        total: 40,
        available: 32,
        issued: 8,
        reorderLevel: 10
      }
    ])
    console.log(`✓ Seeded ${inventory.length} inventory items`)

    // 4. Seed Maintenance Records
    const maintenance = await Maintenance.create([
      {
        asset: "Dell XPS Laptop",
        type: "Thermal Paste & Fan Cleaning",
        date: new Date("2026-09-18"),
        technician: "Arun Kumar",
        cost: 1200,
        status: "Completed"
      },
      {
        asset: "HP LaserJet Pro",
        type: "Toner Roller Replacement",
        date: new Date("2026-09-22"),
        technician: "Karthik R",
        cost: 850,
        status: "In Progress"
      },
      {
        asset: "Epson 4K Projector",
        type: "Lamp & Optics Servicing",
        date: new Date("2026-10-12"),
        technician: "Ravi Shankar",
        cost: 2400,
        status: "Scheduled"
      },
      {
        asset: "Rigol Digital Oscilloscope",
        type: "Annual Calibration & Testing",
        date: new Date("2026-09-15"),
        technician: "Arun Kumar",
        cost: 650,
        status: "Completed"
      }
    ])
    console.log(`✓ Seeded ${maintenance.length} maintenance records`)

    // 5. Seed Usage Records
    const usage = await Usage.create([
      {
        asset: "Dell XPS Laptop",
        user: "Rahul V",
        purpose: "Machine Learning Workshop",
        startDate: new Date("2026-10-05"),
        endDate: new Date("2026-10-10"),
        status: "Active"
      },
      {
        asset: "HP LaserJet Pro",
        user: "Priya Sharma",
        purpose: "Research Paper Printing",
        startDate: new Date("2026-09-28"),
        endDate: new Date("2026-09-28"),
        status: "Completed"
      },
      {
        asset: "Epson 4K Projector",
        user: "Dr. Arun Sundar",
        purpose: "National Robotics Seminar",
        startDate: new Date("2026-10-15"),
        endDate: new Date("2026-10-16"),
        status: "Scheduled"
      },
      {
        asset: "Arduino Uno Rev3",
        user: "Karthik Raja",
        purpose: "IoT Smart Greenhouse Capstone",
        startDate: new Date("2026-10-01"),
        endDate: new Date("2026-10-12"),
        status: "Active"
      }
    ])
    console.log(`✓ Seeded ${usage.length} usage records`)

    console.log("\n========================================")
    console.log("Local development test database seeded successfully!")
    console.log("Dev test Admin: admin@assethub.com / admin123")
    console.log("Dev test Manager: manager@assethub.com / manager123")
    console.log("========================================\n")

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error("Seeding error:", error)
    process.exit(1)
  }
}

seedData()
