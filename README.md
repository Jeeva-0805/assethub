# AssetHub – Smart Inventory and Asset Management System

**Academic Project Title:**
*Smart Inventory and Asset Management System – Manage laboratory equipment and institutional assets by tracking inventory, maintenance schedules, stock levels, and usage reports.*

---

## 📌 Project Overview

**AssetHub** is an enterprise-grade full-stack web application engineered to manage institutional hardware equipment, laboratory apparatus, consumable inventories, preventive/corrective maintenance records, and equipment checkout logs. It replaces manual paper logbooks and decentralized spreadsheets with a reactive, unified cloud architecture powered by **React, Vite, Node.js, Express.js, and MongoDB (via Mongoose ODM)**.

The system incorporates physical-to-digital **Quick Response (QR) code asset tracking**, real-time automated stock threshold calculations, cumulative maintenance cost monitoring, temporal checkout validation, and one-click analytical CSV exports for institutional audit and accreditation reporting.

---

## 🚀 Key Implemented Features

### 1. 🔐 Authentication & Session Security
- **JWT Authentication**: Stateless token-based authentication using `jsonwebtoken` and `bcryptjs` password hashing (10 salt rounds).
- **User Roles & Profiles**: Supports **Admin** and **Lab Manager** roles stored on user profiles and JWT payloads, displayed in the UI navigation and Settings.
- **Route Guarding**: Client-side route protection via React Router (`<ProtectedRoute>`) ensuring unauthenticated requests are automatically redirected to the login interface.
- **Session Persistence**: Token storage and automatic restoration with instant sign-out.

### 2. 📦 Asset Catalog & QR Code Tracking
- **Full CRUD Operations**: Register, update, inspect, and delete institutional equipment with real-time feedback.
- **Status Badges**: Color-coded tracking for *Available* (green), *In Use* (blue), and *Maintenance* (amber).
- **Live Search & Filter**: Instant client-side search across equipment names, categories, and physical room locations.
- **📱 Dynamic QR Code Generation**:
  - Automatically synthesizes high-density QR canvases (`qrcode.react`) with Error Correction Level **H** (up to 30% damage recovery).
  - Encodes the canonical asset verification URL (`/assets/:id`).
  - **Quick QR Modal**: View asset QR code, system identifier, and encoded tracking URL directly from the asset table.
  - **PNG Download Pipeline**: One-click download of physical equipment QR tags (`assethub-[asset-name]-qr.png`) for printing and affixing to hardware.
- **Dedicated Asset Profile (`/assets/:id`)**: Responsive mobile/desktop landing page displaying full hardware specifications, current operational status, and verified QR tag.

### 3. 📋 Consumables & Stock Management
- **Automated Stock Calculations**: Mongoose pre-validation hooks compute issued quantities automatically:
  $$\text{issued} = \max(0, \text{total} - \text{available})$$
- **Low-Stock Alerting**: Highlights items with warning badges and dashboard alerts when available stock is at or below the preset reorder level.
- **Validation Guardrails**: Enforces non-negative counts and validates that available and reorder quantities cannot exceed total acquired stock.

### 4. 🔧 Preventive & Corrective Maintenance Tracking
- **Service Event Logging**: Record scheduled calibrations, routine cleaning, and emergency hardware repairs.
- **Cost Aggregation**: Cumulative calculation of maintenance expenditures for departmental budgeting.
- **Lifecycle Status**: Monitor maintenance progress across *Scheduled*, *In Progress*, and *Completed* states.

### 5. 🔄 Equipment Check-In / Check-Out Auditing
- **Custody Logging**: Track equipment loans, borrowing personnel, and experiment purposes.
- **Temporal Date Validation**: Strict schema validator preventing booking windows where `endDate` precedes `startDate`.
- **Active Utilization Auditing**: Instantly identify currently loaned equipment across departments.

### 6. 📊 Real-Time Analytics Dashboard & Reports
- **Executive Metric Cards**: Dynamic counters for Total Assets, Available Equipment, Assets in Maintenance, and Low Stock Alerts.
- **Aggregated Summaries**: Cross-module metrics calculated directly from database records without data duplication.
- **One-Click CSV Export**: Working client-side CSV stream download for academic compliance, departmental audits, and NBA/NAAC accreditation reviews. Supports filtering by all modules or isolating specific categories.

### 7. ⚙️ Administrative Settings & Professional Design System
- **User Profile Overview**: View active account credentials, role designations, and session status.
- **Modern Typography & Interaction**: Built on the **Inter** typeface with tailored typographic weights (400 to 700), professional pointer cursors, and smooth 0.2s cubic transitions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 6, React Router DOM v7 |
| **Frontend Utilities** | `qrcode.react` (QR canvas engine), Vanilla CSS Design System (Inter font) |
| **Backend Runtime** | Node.js (v18+ / v20+), Express.js (v5) |
| **Database & ODM** | MongoDB (v6+ / v7+), Mongoose ODM (v9) |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS |
| **Build & Toolchain** | Vite HMR, ESLint 10, npm |

---

## 📂 Project Directory Structure

```text
AssetHub/
├── index.html                   # React HTML5 root entry point
├── package.json                 # Frontend dependencies & Vite build scripts
├── package-lock.json
├── vite.config.js               # Vite build toolchain configuration
├── vercel.json                  # Vercel SPA routing rewrite rules
├── .env.example                 # Frontend environment variables template
├── .gitignore                   # Excludes node_modules, build outputs, and secrets
├── README.md                    # Project documentation
│
├── public/                      # Static assets & SVG icons
│   ├── favicon.svg
│   └── icons.svg
│
├── src/                         # React Application Source
│   ├── main.jsx                 # Application bootstrapping
│   ├── App.jsx                  # Route definitions & layout wrappers
│   ├── App.css                  # Design system, components, and layout styling
│   ├── index.css                # Base typography & CSS reset (Inter font)
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication provider & JWT session store
│   ├── services/
│   │   └── api.js               # Centralized fetch client for backend endpoints
│   ├── components/
│   │   ├── AddAssetForm.jsx     # Modal for creating & editing assets
│   │   ├── AddInventoryForm.jsx # Modal for consumable inventory
│   │   ├── AddMaintenanceForm.jsx # Modal for maintenance service tickets
│   │   ├── AddUsageForm.jsx     # Modal for equipment checkouts
│   │   ├── AssetQRModal.jsx     # QR code generator modal with PNG download
│   │   ├── ProtectedRoute.jsx   # Route guard enforcing authentication
│   │   └── Sidebar.jsx          # Collapsible navigation sidebar
│   └── pages/
│       ├── Login.jsx            # Authentication interface with demo quick-fill
│       ├── Dashboard.jsx        # Analytics overview, metric cards & activity
│       ├── Assets.jsx           # Hardware catalog with search, filter & QR actions
│       ├── AssetDetails.jsx     # Dedicated asset verification view (/assets/:id)
│       ├── Inventory.jsx        # Consumable stock ledger with threshold alerts
│       ├── Maintenance.jsx      # Service logs & cumulative expenditure
│       ├── Usage.jsx            # Equipment check-in / check-out records
│       ├── Reports.jsx          # Cross-module summaries & CSV export engine
│       └── Settings.jsx         # Administrative profile & system metadata
│
└── backend/                     # Express REST API Server
    ├── server.js                # Server entry point, CORS, routes & error middleware
    ├── package.json             # Backend dependencies & npm scripts
    ├── package-lock.json
    ├── seed.js                  # Database seeder (with production safeguard)
    ├── test-suite.js            # Automated 23-test-case integration suite
    ├── .env.example             # Backend environment variables template
    ├── .gitignore               # Backend exclusion rules
    ├── config/
    │   └── db.js                # Mongoose MongoDB connection manager
    ├── middleware/
    │   └── authMiddleware.js    # JWT verification & route guard middleware
    ├── models/
    │   ├── User.js              # User account schema with password hashing
    │   ├── Asset.js             # Hardware asset schema
    │   ├── Assets.js            # Backward-compatibility alias
    │   ├── Inventory.js         # Consumable stock schema with validation hooks
    │   ├── Maintenance.js       # Maintenance service schema
    │   └── Usage.js             # Equipment checkout schema with date validation
    ├── controllers/
    │   ├── authController.js    # Register, login, and user profile logic
    │   ├── assetController.js   # Asset CRUD and QR lookup controllers
    │   ├── inventoryController.js # Inventory CRUD and stock adjustments
    │   ├── maintenanceController.js # Service ticket tracking and cost aggregation
    │   ├── usageController.js   # Checkout scheduling and status transitions
    │   └── reportController.js  # Concurrent multi-collection summary aggregation
    └── routes/
        ├── authRoutes.js        # /api/auth endpoints
        ├── assetRoutes.js       # /api/assets endpoints
        ├── inventoryRoutes.js   # /api/inventory endpoints
        ├── maintenanceRoutes.js # /api/maintenance endpoints
        ├── usageRoutes.js       # /api/usage endpoints
        └── reportRoutes.js      # /api/reports endpoints
```

---

## ⚙️ Environment Configuration

Environment variables must be configured via `.env` files in their respective folders. **Never commit `.env` files to source control.** Template files (`.env.example`) are provided with dummy placeholders.

### 1. Frontend Environment (`AssetHub/.env`)
Create `.env` in the `AssetHub/` root directory:
```env
# Points to your local or deployed backend API
VITE_API_URL=http://localhost:5000/api

# Optional: Set public frontend URL for QR code resolution in production
VITE_APP_URL=http://localhost:5173
```

### 2. Backend Environment (`AssetHub/backend/.env`)
Create `.env` in the `AssetHub/backend/` directory:
```env
# MongoDB Connection String (Local MongoDB or MongoDB Atlas SRV)
MONGO_URI=mongodb://localhost:27017/assethub

# Server Port
PORT=5000

# Cryptographic secret for signing JWT bearer tokens
JWT_SECRET=your_secure_jwt_secret_here

# Allowed frontend origin for CORS in production
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js** (v18.x, v20.x, or v22.x LTS)
- **npm** (v9.x or higher)
- **MongoDB** (Local MongoDB Community Server running on `localhost:27017` or a free MongoDB Atlas cluster)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Jeeva-0805/assethub.git
cd assethub
```

### Step 2: Set Up Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local MongoDB URI and a random JWT_SECRET
```

### Step 3: Populate Sample Data (Local Development Only)
To populate a fresh local development database with sample laboratory assets, consumables, maintenance logs, and testing accounts:
```bash
npm run seed
```

> ⚠️ **Production Safeguard Notice:**
> The `seed.js` script includes an automated guard:
> ```javascript
> if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED_IN_PRODUCTION) {
>   console.error("CRITICAL SAFETY BLOCK: Database seeding is disabled in production environment.")
>   process.exit(1)
> }
> ```
> This prevents accidental data deletion or account creation in production. Production authentication does **not** rely on these defaults; production users must be registered via the API or created directly with strong, unique credentials.

### 👤 Local Development Test Accounts
These accounts are created exclusively when running the optional development seed script:
| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@assethub.com` | `admin123` | Local development & UI demo only |
| **Lab Manager** | `manager@assethub.com` | `manager123` | Local development & UI demo only |

### Step 4: Start the Backend Server
```bash
# Production mode:
npm start

# Or development mode with auto-reload:
npm run dev
```
The API server will listen on `http://localhost:5000`.

### Step 5: Set Up Frontend
Open a new terminal window:
```bash
# Navigate to the frontend root
cd assethub
npm install
cp .env.example .env
npm run dev
```
The client will launch at `http://localhost:5173/`.

---

## 🧪 Automated Testing

AssetHub includes an automated backend integration test suite in `backend/test-suite.js`. The suite executes 23 distinct assertions validating HTTP status codes, security guards, input validation, and business logic against live endpoints.

### Running the Test Suite
Ensure the backend server is running on `http://localhost:5000`, then execute:
```bash
cd backend
node test-suite.js
```

### Test Coverage Matrix (23 Passed Assertions)
- **System Health:** Root health probe (`GET /`).
- **Authentication & Security:** Invalid login rejection (401), valid admin login (200), token validation (`/auth/me`), and route protection for unauthenticated requests (401).
- **Asset Catalog:** List assets, create asset, fetch asset by ID (QR resolution endpoint), update asset, and delete asset.
- **Inventory Engine:** Quantity validation (rejects invalid counts with 400), automatic `issued = total - available` calculation hook, item updates, and deletion.
- **Maintenance Ledger:** Cost validation (rejects negative cost with 400), service task scheduling, status updates, and record deletion.
- **Usage & Checkouts:** Temporal validation (rejects `endDate < startDate` with 400), equipment checkout creation, return updates, and deletion.
- **Analytical Reports:** Aggregated metric calculations across all collections (`GET /api/reports/summary`).

---

## ☁️ Deployment Guide

AssetHub is structured for independent cloud hosting using standard free-tier services:

### 1. Database Deployment (MongoDB Atlas)
1. Create a free shared cluster (M0) on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with least-privilege permissions (`readWrite` restricted to the `assethub` database only) and a strong, randomly generated password.
3. Configure **Network Access**:
   - For free-tier platforms like Render that use dynamic outbound IP addresses, setting `0.0.0.0/0` (Allow access from anywhere) is typically required to allow cloud connectivity.
   - ⚠️ **Security Trade-off:** Allowing `0.0.0.0/0` exposes the database port to the public internet. To mitigate this risk, enforce a strong 24+ character database user password and restrict user privileges to the application database. If your hosting provider offers static outbound IPs or VPC peering, whitelist only those specific addresses instead.
4. Copy the SRV connection URI: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/assethub?retryWrites=true&w=majority`.

### 2. Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com) linked to your GitHub repository.
2. Configure settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add Environment Variables in the Render dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: A generated 256-bit random string
   - `FRONTEND_URL`: Your deployed Vercel domain (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`

### 3. Frontend Deployment (Vercel)
1. Import the repository on [Vercel](https://vercel.com).
2. Configure settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `.` (Repository root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variables in the Vercel dashboard:
   - `VITE_API_URL`: Your live Render backend URL (e.g., `https://your-service.onrender.com/api`)
   - `VITE_APP_URL`: Your live Vercel domain (e.g., `https://your-app.vercel.app`)
4. The included `vercel.json` automatically manages client-side SPA route rewrites for React Router.

---

## 📄 License & Attribution

This project was developed as an academic capstone and portfolio project for institutional laboratory asset and inventory automation. All rights reserved.
