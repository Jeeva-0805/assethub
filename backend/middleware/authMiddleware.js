const jwt = require("jsonwebtoken")
const User = require("../models/User")

const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const secret = process.env.JWT_SECRET || "assethub_jwt_secret_dev_key_2026_secure"
      const decoded = jwt.verify(token, secret)

      req.user = await User.findById(decoded.id).select("-password")
      if (!req.user) {
        return res.status(401).json({ message: "User not found, authorization denied" })
      }

      return next()
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token invalid or expired" })
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" })
  }
}

module.exports = { protect }
