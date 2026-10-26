// Automated Test Suite for AssetHub REST API
const BASE_URL = "http://localhost:5000/api"

async function runTests() {
  console.log("==========================================")
  console.log("STARTING ASSETHUB API TEST SUITE")
  console.log("==========================================\n")

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

  // 1. Health check
  await test("Root Health Endpoint", async () => {
    const res = await fetch("http://localhost:5000/")
    const data = await res.json()
    if (res.status !== 200 || data.status !== "online") {
      throw new Error(`Expected online, got ${JSON.stringify(data)}`)
    }
  })

  // 2. Auth: Invalid Login
  await test("Auth - Invalid Credentials (401)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@assethub.com", password: "wrongpassword" })
    })
    if (res.status !== 401) {
      throw new Error(`Expected status 401, got ${res.status}`)
    }
  })

  // 3. Auth: Valid Login
  let token = ""
  await test("Auth - Valid Admin Login", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@assethub.com", password: "admin123" })
    })
    const data = await res.json()
    if (res.status !== 200 || !data.token || data.role !== "Admin") {
      throw new Error(`Failed to login admin: ${JSON.stringify(data)}`)
    }
    token = data.token
  })

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  }

  // 4. Auth: Protected Route Check
  await test("Auth - Token Verification (/auth/me)", async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders })
    const data = await res.json()
    if (res.status !== 200 || data.email !== "admin@assethub.com") {
      throw new Error(`Auth /me failed: ${JSON.stringify(data)}`)
    }
  })

  // 5. Auth - Missing Token should be rejected (401)
  await test("Auth - Route Guard without Token (401)", async () => {
    const res = await fetch(`${BASE_URL}/assets`)
    if (res.status !== 401) {
      throw new Error(`Expected 401, got ${res.status}`)
    }
  })

  // 6. Assets CRUD
  let testAssetId = ""
  await test("Assets - GET all assets", async () => {
    const res = await fetch(`${BASE_URL}/assets`, { headers: authHeaders })
    const data = await res.json()
    if (res.status !== 200 || !Array.isArray(data)) {
      throw new Error(`Failed to fetch assets list`)
    }
  })

  await test("Assets - POST new asset", async () => {
    const res = await fetch(`${BASE_URL}/assets`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Test Spectrophotometer",
        category: "Laboratory Equipment",
        status: "Available",
        location: "Chem Lab 4"
      })
    })
    const data = await res.json()
    if (res.status !== 201 || !data._id || data.name !== "Test Spectrophotometer") {
      throw new Error(`Failed to create asset: ${JSON.stringify(data)}`)
    }
    testAssetId = data._id
  })

  await test("Assets - GET single asset by ID (Used by QR & AssetDetails)", async () => {
    const res = await fetch(`${BASE_URL}/assets/${testAssetId}`, { headers: authHeaders })
    const data = await res.json()
    if (res.status !== 200 || data._id !== testAssetId || data.name !== "Test Spectrophotometer") {
      throw new Error(`Failed to fetch asset by ID: ${JSON.stringify(data)}`)
    }
  })

  await test("Assets - PUT update asset", async () => {
    const res = await fetch(`${BASE_URL}/assets/${testAssetId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        status: "In Use",
        location: "Physics Lab 2"
      })
    })
    const data = await res.json()
    if (res.status !== 200 || data.status !== "In Use" || data.location !== "Physics Lab 2") {
      throw new Error(`Failed to update asset: ${JSON.stringify(data)}`)
    }
  })

  await test("Assets - DELETE asset", async () => {
    const res = await fetch(`${BASE_URL}/assets/${testAssetId}`, {
      method: "DELETE",
      headers: authHeaders
    })
    const data = await res.json()
    if (res.status !== 200) {
      throw new Error(`Failed to delete asset: ${JSON.stringify(data)}`)
    }
  })

  // 7. Inventory CRUD & Validation
  let testInventoryId = ""
  await test("Inventory - Validation blocks invalid quantities (400)", async () => {
    const res = await fetch(`${BASE_URL}/inventory`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Bad Item",
        category: "Test",
        total: 10,
        available: 15, // available > total
        reorderLevel: 5
      })
    })
    if (res.status !== 400) {
      throw new Error(`Expected 400 for available > total, got ${res.status}`)
    }
  })

  await test("Inventory - POST valid item with issued calculation", async () => {
    const res = await fetch(`${BASE_URL}/inventory`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Test Jumper Wires",
        category: "Components",
        total: 50,
        available: 35,
        reorderLevel: 10
      })
    })
    const data = await res.json()
    if (res.status !== 201 || data.issued !== 15) {
      throw new Error(`Failed to create inventory or issued != 15: ${JSON.stringify(data)}`)
    }
    testInventoryId = data._id
  })

  await test("Inventory - PUT update item", async () => {
    const res = await fetch(`${BASE_URL}/inventory/${testInventoryId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        total: 50,
        available: 20, // issued should become 30
        reorderLevel: 10
      })
    })
    const data = await res.json()
    if (res.status !== 200 || data.available !== 20 || data.issued !== 30) {
      throw new Error(`Failed to update inventory: ${JSON.stringify(data)}`)
    }
  })

  await test("Inventory - DELETE item", async () => {
    const res = await fetch(`${BASE_URL}/inventory/${testInventoryId}`, {
      method: "DELETE",
      headers: authHeaders
    })
    if (res.status !== 200) {
      throw new Error(`Failed to delete inventory item`)
    }
  })

  // 8. Maintenance CRUD & Validation
  let testMaintId = ""
  await test("Maintenance - Validation blocks negative cost (400)", async () => {
    const res = await fetch(`${BASE_URL}/maintenance`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        asset: "Dell XPS Laptop",
        type: "Repair",
        date: "2026-10-10",
        technician: "Sam",
        cost: -50
      })
    })
    if (res.status !== 400) {
      throw new Error(`Expected 400 for negative cost, got ${res.status}`)
    }
  })

  await test("Maintenance - POST valid maintenance record", async () => {
    const res = await fetch(`${BASE_URL}/maintenance`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        asset: "Dell XPS Laptop",
        type: "RAM Upgrade",
        date: "2026-10-11",
        technician: "Sam",
        cost: 2500,
        status: "Scheduled"
      })
    })
    const data = await res.json()
    if (res.status !== 201 || !data._id) {
      throw new Error(`Failed to create maintenance record`)
    }
    testMaintId = data._id
  })

  await test("Maintenance - PUT update record", async () => {
    const res = await fetch(`${BASE_URL}/maintenance/${testMaintId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ status: "Completed" })
    })
    const data = await res.json()
    if (res.status !== 200 || data.status !== "Completed") {
      throw new Error(`Failed to update maintenance record`)
    }
  })

  await test("Maintenance - DELETE record", async () => {
    const res = await fetch(`${BASE_URL}/maintenance/${testMaintId}`, {
      method: "DELETE",
      headers: authHeaders
    })
    if (res.status !== 200) {
      throw new Error(`Failed to delete maintenance record`)
    }
  })

  // 9. Usage CRUD & Date Validation
  let testUsageId = ""
  await test("Usage - Validation blocks endDate < startDate (400)", async () => {
    const res = await fetch(`${BASE_URL}/usage`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        asset: "Dell XPS Laptop",
        user: "Alex",
        purpose: "Testing",
        startDate: "2026-10-20",
        endDate: "2026-10-15" // Invalid date range
      })
    })
    if (res.status !== 400) {
      throw new Error(`Expected 400 for endDate < startDate, got ${res.status}`)
    }
  })

  await test("Usage - POST valid usage record", async () => {
    const res = await fetch(`${BASE_URL}/usage`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        asset: "Dell XPS Laptop",
        user: "Alex",
        purpose: "Final Year Demo",
        startDate: "2026-10-20",
        endDate: "2026-10-22",
        status: "Scheduled"
      })
    })
    const data = await res.json()
    if (res.status !== 201 || !data._id) {
      throw new Error(`Failed to create usage record`)
    }
    testUsageId = data._id
  })

  await test("Usage - PUT update record", async () => {
    const res = await fetch(`${BASE_URL}/usage/${testUsageId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ status: "Active" })
    })
    const data = await res.json()
    if (res.status !== 200 || data.status !== "Active") {
      throw new Error(`Failed to update usage record`)
    }
  })

  await test("Usage - DELETE record", async () => {
    const res = await fetch(`${BASE_URL}/usage/${testUsageId}`, {
      method: "DELETE",
      headers: authHeaders
    })
    if (res.status !== 200) {
      throw new Error(`Failed to delete usage record`)
    }
  })

  // 10. Reports Summary Endpoint
  await test("Reports - GET summary returns calculated metrics", async () => {
    const res = await fetch(`${BASE_URL}/reports/summary`, { headers: authHeaders })
    const data = await res.json()
    if (
      res.status !== 200 ||
      typeof data.asset?.total !== "number" ||
      typeof data.inventory?.totalUnits !== "number" ||
      typeof data.maintenance?.totalCost !== "number" ||
      typeof data.usage?.totalRecords !== "number"
    ) {
      throw new Error(`Report summary failed: ${JSON.stringify(data)}`)
    }
  })

  console.log("\n==========================================")
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log("==========================================")

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch(console.error)
