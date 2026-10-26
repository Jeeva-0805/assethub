// Test Suite for AssetHub Administrator Setup Flow
// Tests: Validation, Role Escalation Protection, Duplicate Handling, Repeated Setup, and Concurrency
const {
  getSetupStatus,
  setupInitialAdmin,
  registerUser
} = require('./controllers/authController')
const User = require('./models/User')

// Mock Response helper
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

async function runSetupTests() {
  console.log("==================================================")
  console.log("RUNNING ASSETHUB INITIAL SETUP SECURITY TEST SUITE")
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

  // --- 1. Client & Server Input Validation Tests ---
  await test("Setup - Reject empty name", async () => {
    const req = { body: { name: "   ", email: "admin@test.com", password: "password123", confirmPassword: "password123" } }
    const res = createMockRes()
    await setupInitialAdmin(req, res)
    if (res.statusCode !== 400 || !res.body.message.includes("Name cannot be empty")) {
      throw new Error(`Expected 400 empty name, got ${res.statusCode}: ${JSON.stringify(res.body)}`)
    }
  })

  await test("Setup - Reject invalid email format", async () => {
    const req = { body: { name: "Admin", email: "not-an-email", password: "password123", confirmPassword: "password123" } }
    const res = createMockRes()
    await setupInitialAdmin(req, res)
    if (res.statusCode !== 400 || !res.body.message.includes("valid email address")) {
      throw new Error(`Expected 400 invalid email, got ${res.statusCode}: ${JSON.stringify(res.body)}`)
    }
  })

  await test("Setup - Reject password shorter than 6 characters", async () => {
    const req = { body: { name: "Admin", email: "admin@test.com", password: "123", confirmPassword: "123" } }
    const res = createMockRes()
    await setupInitialAdmin(req, res)
    if (res.statusCode !== 400 || !res.body.message.includes("at least 6 characters")) {
      throw new Error(`Expected 400 short password, got ${res.statusCode}: ${JSON.stringify(res.body)}`)
    }
  })

  await test("Setup - Reject mismatched passwords", async () => {
    const req = { body: { name: "Admin", email: "admin@test.com", password: "password123", confirmPassword: "password456" } }
    const res = createMockRes()
    await setupInitialAdmin(req, res)
    if (res.statusCode !== 400 || !res.body.message.includes("Passwords do not match")) {
      throw new Error(`Expected 400 mismatched password, got ${res.statusCode}: ${JSON.stringify(res.body)}`)
    }
  })

  // --- 2. Repeated Setup Protection ---
  await test("Setup - Repeated attempt blocked when Admin already exists (403)", async () => {
    const originalExists = User.exists
    User.exists = async () => true // Simulate an existing Admin in database

    try {
      const req = { body: { name: "Admin", email: "newadmin@test.com", password: "password123", confirmPassword: "password123" } }
      const res = createMockRes()
      await setupInitialAdmin(req, res)
      if (res.statusCode !== 403 || !res.body.message.includes("already been completed")) {
        throw new Error(`Expected 403 when admin exists, got ${res.statusCode}: ${JSON.stringify(res.body)}`)
      }
    } finally {
      User.exists = originalExists
    }
  })

  // --- 3. Setup Status Endpoint ---
  await test("Setup Status - Returns setupRequired: false when Admin exists", async () => {
    const originalExists = User.exists
    User.exists = async () => true

    try {
      const req = {}
      const res = createMockRes()
      await getSetupStatus(req, res)
      if (res.statusCode !== 200 || res.body.setupRequired !== false) {
        throw new Error(`Expected setupRequired: false, got: ${JSON.stringify(res.body)}`)
      }
    } finally {
      User.exists = originalExists
    }
  })

  await test("Setup Status - Returns setupRequired: true when NO Admin exists", async () => {
    const originalExists = User.exists
    User.exists = async () => false

    try {
      const req = {}
      const res = createMockRes()
      await getSetupStatus(req, res)
      if (res.statusCode !== 200 || res.body.setupRequired !== true) {
        throw new Error(`Expected setupRequired: true, got: ${JSON.stringify(res.body)}`)
      }
    } finally {
      User.exists = originalExists
    }
  })

  // --- 4. Role Escalation Prevention on Public Register ---
  await test("Security - Unauthenticated caller cannot register as Admin (403)", async () => {
    const req = {
      headers: {},
      body: { name: "Attacker", email: "attacker@test.com", password: "password123", role: "Admin" }
    }
    const res = createMockRes()
    await registerUser(req, res)
    if (res.statusCode !== 403 || !res.body.message.includes("Public registration for Administrator accounts is not permitted")) {
      throw new Error(`Expected 403 role escalation block, got ${res.statusCode}: ${JSON.stringify(res.body)}`)
    }
  })

  await test("Security - Public registration defaults role to Lab Manager if non-admin", async () => {
    const originalExists = User.exists
    const originalFindOne = User.findOne
    const originalCreate = User.create

    User.exists = async () => true // Admin exists
    User.findOne = async () => null // Email not taken
    let createdRole = null
    User.create = async (doc) => {
      createdRole = doc.role
      return { _id: "dummy_id", ...doc }
    }

    try {
      const req = {
        headers: {},
        body: { name: "Regular Staff", email: "staff@test.com", password: "password123" }
      }
      const res = createMockRes()
      await registerUser(req, res)
      if (res.statusCode !== 201 || createdRole !== "Lab Manager") {
        throw new Error(`Expected role 'Lab Manager', got ${createdRole} (status ${res.statusCode})`)
      }
    } finally {
      User.exists = originalExists
      User.findOne = originalFindOne
      User.create = originalCreate
    }
  })

  // --- 5. Duplicate Email Handling ---
  await test("Setup - Rejects duplicate email (400)", async () => {
    const originalExists = User.exists
    const originalFindOne = User.findOne

    User.exists = async () => false
    User.findOne = async () => ({ email: "existing@test.com" })

    try {
      const req = { body: { name: "Admin", email: "existing@test.com", password: "password123", confirmPassword: "password123" } }
      const res = createMockRes()
      await setupInitialAdmin(req, res)
      if (res.statusCode !== 400 || !res.body.message.includes("already exists")) {
        throw new Error(`Expected 400 duplicate email, got ${res.statusCode}: ${JSON.stringify(res.body)}`)
      }
    } finally {
      User.exists = originalExists
      User.findOne = originalFindOne
    }
  })

  // --- 6. Concurrency Protection Simulation ---
  await test("Concurrency - Unique constraint blocks concurrent race conditions (409)", async () => {
    const originalExists = User.exists
    const originalFindOne = User.findOne
    const originalCreate = User.create

    let callCount = 0
    User.exists = async () => false // Both concurrent requests pass pre-check
    User.findOne = async () => null

    User.create = async (doc) => {
      callCount++
      if (callCount === 1) {
        return { _id: "admin_1", ...doc }
      }
      // Second concurrent request hits MongoDB unique constraint
      const dupError = new Error("E11000 duplicate key error")
      dupError.code = 11000
      dupError.keyPattern = { isInitialAdmin: 1 }
      throw dupError
    }

    try {
      const req1 = { body: { name: "Admin 1", email: "admin1@test.com", password: "password123", confirmPassword: "password123" } }
      const req2 = { body: { name: "Admin 2", email: "admin2@test.com", password: "password123", confirmPassword: "password123" } }

      const res1 = createMockRes()
      const res2 = createMockRes()

      await Promise.all([
        setupInitialAdmin(req1, res1),
        setupInitialAdmin(req2, res2)
      ])

      const statuses = [res1.statusCode, res2.statusCode].sort()
      if (statuses[0] !== 201 || statuses[1] !== 409) {
        throw new Error(`Expected [201, 409], got ${JSON.stringify(statuses)}`)
      }
    } finally {
      User.exists = originalExists
      User.findOne = originalFindOne
      User.create = originalCreate
    }
  })

  console.log("\n==================================================")
  console.log(`TEST SUITE FINISHED: ${passed} Passed, ${failed} Failed`)
  console.log("==================================================")

  if (failed > 0) {
    process.exit(1)
  }
}

runSetupTests()
