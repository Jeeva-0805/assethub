const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const token = localStorage.getItem("assethub_token")

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers
  }

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorMessage =
        data.message ||
        (Array.isArray(data.errors) ? data.errors.join(", ") : "Request failed")
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to server. Please check if the backend is running.")
    }
    throw error
  }
}

// Authentication
export const login = (credentials) =>
  request("/auth/login", { method: "POST", body: credentials })

export const register = (userData) =>
  request("/auth/register", { method: "POST", body: userData })

export const getMe = () =>
  request("/auth/me", { method: "GET" })

// Assets
export const getAssets = () =>
  request("/assets", { method: "GET" })

export const getAsset = (id) =>
  request(`/assets/${id}`, { method: "GET" })

export const createAsset = (assetData) =>
  request("/assets", { method: "POST", body: assetData })

export const updateAsset = (id, assetData) =>
  request(`/assets/${id}`, { method: "PUT", body: assetData })

export const deleteAsset = (id) =>
  request(`/assets/${id}`, { method: "DELETE" })

// Inventory
export const getInventory = () =>
  request("/inventory", { method: "GET" })

export const getInventoryItem = (id) =>
  request(`/inventory/${id}`, { method: "GET" })

export const createInventory = (itemData) =>
  request("/inventory", { method: "POST", body: itemData })

export const updateInventory = (id, itemData) =>
  request(`/inventory/${id}`, { method: "PUT", body: itemData })

export const deleteInventory = (id) =>
  request(`/inventory/${id}`, { method: "DELETE" })

// Maintenance
export const getMaintenance = () =>
  request("/maintenance", { method: "GET" })

export const getMaintenanceRecord = (id) =>
  request(`/maintenance/${id}`, { method: "GET" })

export const createMaintenance = (recordData) =>
  request("/maintenance", { method: "POST", body: recordData })

export const updateMaintenance = (id, recordData) =>
  request(`/maintenance/${id}`, { method: "PUT", body: recordData })

export const deleteMaintenance = (id) =>
  request(`/maintenance/${id}`, { method: "DELETE" })

// Usage
export const getUsage = () =>
  request("/usage", { method: "GET" })

export const getUsageRecord = (id) =>
  request(`/usage/${id}`, { method: "GET" })

export const createUsage = (recordData) =>
  request("/usage", { method: "POST", body: recordData })

export const updateUsage = (id, recordData) =>
  request(`/usage/${id}`, { method: "PUT", body: recordData })

export const deleteUsage = (id) =>
  request(`/usage/${id}`, { method: "DELETE" })

// Reports
export const getReportsSummary = () =>
  request("/reports/summary", { method: "GET" })
