const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const User = require("../models/User")

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "assethub_jwt_secret_dev_key_2026_secure",
    { expiresIn: "30d" }
  )
}

// @desc    Check whether initial administrator setup is required
// @route   GET /api/auth/setup-status
// @access  Public
const getSetupStatus = async (req, res) => {
  try {
    const adminExists = await User.exists({
      $or: [
        { role: "Admin" },
        { isInitialAdmin: true }
      ]
    })
    return res.json({
      setupRequired: !adminExists
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to determine system setup status",
      error: error.message
    })
  }
}

// @desc    Perform initial administrator setup (one-time only)
// @route   POST /api/auth/setup
// @access  Public (only when no Admin exists)
const setupInitialAdmin = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields: name, email, and password"
      })
    }

    const trimmedName = String(name).trim()
    const trimmedEmail = String(email).toLowerCase().trim()

    if (!trimmedName) {
      return res.status(400).json({
        message: "Name cannot be empty"
      })
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address"
      })
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      })
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      })
    }

    // Ensure model indexes are physically built in MongoDB when database is connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await User.init()
    }

    // Verify no Admin or initial admin already exists
    const adminExists = await User.exists({
      $or: [
        { role: "Admin" },
        { isInitialAdmin: true }
      ]
    })
    if (adminExists) {
      return res.status(403).json({
        message: "Initial setup has already been completed. An administrator account already exists."
      })
    }

    // Check duplicate email
    const userExists = await User.findOne({ email: trimmedEmail })
    if (userExists) {
      return res.status(400).json({
        message: "A user with this email address already exists"
      })
    }

    // Create initial admin with atomic sparse unique index on isInitialAdmin
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: "Admin",
      isInitialAdmin: true
    })

    return res.status(201).json({
      message: "Administrator account created successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.isInitialAdmin) {
        return res.status(409).json({
          message: "Initial setup has already been completed or is currently in progress."
        })
      }
      return res.status(400).json({
        message: "A user with this email address already exists"
      })
    }
    return res.status(500).json({
      message: "Server error during initial administrator setup",
      error: error.message
    })
  }
}

// @desc    Register a new user (Lab Manager or Admin by authenticated Admin)
// @route   POST /api/auth/register
// @access  Public (Lab Manager only) / Admin (any role)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields: name, email, and password"
      })
    }

    const trimmedName = String(name).trim()
    const trimmedEmail = String(email).toLowerCase().trim()

    if (!trimmedName) {
      return res.status(400).json({
        message: "Name cannot be empty"
      })
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address"
      })
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      })
    }

    // Role Escalation Check: Verify if caller has an active Admin session
    let isCallerAdmin = false
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      try {
        const token = req.headers.authorization.split(" ")[1]
        const secret = process.env.JWT_SECRET || "assethub_jwt_secret_dev_key_2026_secure"
        const decoded = jwt.verify(token, secret)
        const caller = await User.findById(decoded.id).select("role")
        if (caller && caller.role === "Admin") {
          isCallerAdmin = true
        }
      } catch (e) {
        // Token invalid or expired
      }
    }

    // If caller is NOT an authenticated Admin:
    if (!isCallerAdmin) {
      // Disallow unauthenticated creation of Admin accounts
      if (role === "Admin") {
        return res.status(403).json({
          message: "Public registration for Administrator accounts is not permitted. Only an existing administrator can create Admin accounts."
        })
      }

      // If no admin exists in the system yet, require initial setup first
      const adminExists = await User.exists({
        $or: [
          { role: "Admin" },
          { isInitialAdmin: true }
        ]
      })
      if (!adminExists) {
        return res.status(403).json({
          message: "System setup is required. Please create the initial administrator account before registering other users."
        })
      }
    }

    const userExists = await User.findOne({ email: trimmedEmail })
    if (userExists) {
      return res.status(400).json({
        message: "A user with this email already exists"
      })
    }

    // Unauthenticated callers always receive "Lab Manager" role
    const assignedRole = isCallerAdmin && (role === "Admin" || role === "Lab Manager")
      ? role
      : "Lab Manager"

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: assignedRole
    })

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error during registration",
      error: error.message
    })
  }
}

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both email and password"
      })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      })
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  } catch (error) {
    return res.status(500).json({
      message: "Server error during login",
      error: error.message
    })
  }
}

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    return res.json(req.user)
  } catch (error) {
    return res.status(500).json({
      message: "Server error fetching user profile"
    })
  }
}

module.exports = {
  getSetupStatus,
  setupInitialAdmin,
  registerUser,
  loginUser,
  getMe
}
