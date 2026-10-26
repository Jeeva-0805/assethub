// Unit tests for Maintenance & Usage asset resolution logic
const { createMaintenanceRecord } = require('./controllers/maintenanceController')
const { createUsageRecord } = require('./controllers/usageController')
const Maintenance = require('./models/Maintenance')
const Usage = require('./models/Usage')
const Asset = require('./models/Asset')

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.body = data
      return this
    }
  }
  return res
}

async function runTests() {
  console.log("==================================================")
  console.log("TESTING MAINTENANCE & USAGE ASSET RESOLUTION LOGIC")
  console.log("==================================================\n")

  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      await fn()
      console.log(`✓ PASS: ${name}`)
      passed++
    } catch (err) {
      console.error(`✗ FAIL: ${name} -> ${err.message}`)
      failed++
    }
  }

  // 1. Maintenance with asset name
  await test("Maintenance - Saves asset by name and links assetId", async () => {
    const originalFindOne = Asset.findOne
    const originalCreate = Maintenance.create

    Asset.findOne = async () => ({ _id: "507f1f77bcf86cd799439011", name: "Dell XPS Laptop" })
    let savedDoc = null
    Maintenance.create = async (doc) => {
      savedDoc = doc
      return { _id: "maint_1", ...doc }
    }

    try {
      const req = {
        body: {
          asset: "Dell XPS Laptop",
          type: "Repair",
          date: "2026-10-15",
          technician: "John",
          cost: 150,
          status: "Scheduled"
        }
      }
      const res = createMockRes()
      await createMaintenanceRecord(req, res)

      if (res.statusCode !== 201 || savedDoc.asset !== "Dell XPS Laptop" || !savedDoc.assetId) {
        throw new Error(`Expected 201 with asset name and assetId, got ${res.statusCode}: ${JSON.stringify(savedDoc)}`)
      }
    } finally {
      Asset.findOne = originalFindOne
      Maintenance.create = originalCreate
    }
  })

  // 2. Maintenance with assetId
  await test("Maintenance - Resolves assetId to asset name", async () => {
    const originalFindById = Asset.findById
    const originalCreate = Maintenance.create

    Asset.findById = async () => ({ _id: "507f1f77bcf86cd799439011", name: "Epson 4K Projector" })
    let savedDoc = null
    Maintenance.create = async (doc) => {
      savedDoc = doc
      return { _id: "maint_2", ...doc }
    }

    try {
      const req = {
        body: {
          assetId: "507f1f77bcf86cd799439011",
          type: "Inspection",
          date: "2026-10-16",
          technician: "Jane",
          cost: 200,
          status: "Scheduled"
        }
      }
      const res = createMockRes()
      await createMaintenanceRecord(req, res)

      if (res.statusCode !== 201 || savedDoc.asset !== "Epson 4K Projector") {
        throw new Error(`Expected resolved asset name 'Epson 4K Projector', got ${JSON.stringify(savedDoc)}`)
      }
    } finally {
      Asset.findById = originalFindById
      Maintenance.create = originalCreate
    }
  })

  // 3. Usage with asset name
  await test("Usage - Saves asset by name and links assetId", async () => {
    const originalFindOne = Asset.findOne
    const originalCreate = Usage.create

    Asset.findOne = async () => ({ _id: "507f1f77bcf86cd799439011", name: "Arduino Uno Rev3" })
    let savedDoc = null
    Usage.create = async (doc) => {
      savedDoc = doc
      return { _id: "usage_1", ...doc }
    }

    try {
      const req = {
        body: {
          asset: "Arduino Uno Rev3",
          user: "Alice",
          purpose: "IoT Lab Experiment",
          startDate: "2026-10-20",
          endDate: "2026-10-22",
          status: "Active"
        }
      }
      const res = createMockRes()
      await createUsageRecord(req, res)

      if (res.statusCode !== 201 || savedDoc.asset !== "Arduino Uno Rev3" || !savedDoc.assetId) {
        throw new Error(`Expected 201 with asset name and assetId, got ${res.statusCode}: ${JSON.stringify(savedDoc)}`)
      }
    } finally {
      Asset.findOne = originalFindOne
      Usage.create = originalCreate
    }
  })

  // 4. Usage with assetId
  await test("Usage - Resolves assetId to asset name", async () => {
    const originalFindById = Asset.findById
    const originalCreate = Usage.create

    Asset.findById = async () => ({ _id: "507f1f77bcf86cd799439022", name: "Rigol Oscilloscope" })
    let savedDoc = null
    Usage.create = async (doc) => {
      savedDoc = doc
      return { _id: "usage_2", ...doc }
    }

    try {
      const req = {
        body: {
          assetId: "507f1f77bcf86cd799439022",
          user: "Bob",
          purpose: "Circuit Testing",
          startDate: "2026-10-20",
          endDate: "2026-10-22",
          status: "Scheduled"
        }
      }
      const res = createMockRes()
      await createUsageRecord(req, res)

      if (res.statusCode !== 201 || savedDoc.asset !== "Rigol Oscilloscope") {
        throw new Error(`Expected resolved asset name 'Rigol Oscilloscope', got ${JSON.stringify(savedDoc)}`)
      }
    } finally {
      Asset.findById = originalFindById
      Usage.create = originalCreate
    }
  })

  // 5. Validation - Missing asset rejected
  await test("Validation - Missing asset rejected in maintenance and usage", async () => {
    const resM = createMockRes()
    await createMaintenanceRecord({ body: { type: "Repair", date: "2026-10-10", technician: "Sam", cost: 10 } }, resM)
    if (resM.statusCode !== 400) throw new Error("Expected 400 for maintenance without asset")

    const resU = createMockRes()
    await createUsageRecord({ body: { user: "Bob", purpose: "Test", startDate: "2026-10-10", endDate: "2026-10-11" } }, resU)
    if (resU.statusCode !== 400) throw new Error("Expected 400 for usage without asset")
  })

  console.log("\n==================================================")
  console.log(`ASSET RESOLUTION TESTS: ${passed} Passed, ${failed} Failed`)
  console.log("==================================================")

  if (failed > 0) process.exit(1)
}

runTests()
