const jwt = require("jsonwebtoken")
const User = require("../models/User")

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "assethub_jwt_secret_dev_key_2026_secure",
    { expiresIn: "30d" }
  )
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields: name, email, and password"
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      })
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() })
    if (userExists) {
      return res.status(400).json({
        message: "A user with this email already exists"
      })
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "Admin"
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
  registerUser,
  loginUser,
  getMe
}
