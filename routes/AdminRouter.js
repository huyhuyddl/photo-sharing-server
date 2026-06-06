const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../db/userModel");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "photo-sharing-secret-key";
const authMiddleware = require("./authMiddleware");

router.post("/login", async (request, response) => {
  const { login_name, password } = request.body;

  if (!login_name) {
    return response.status(400).json({ error: "Missing login_name" });
  }
  if (!password) {
    return response.status(400).json({ error: "Missing password" });
  }

  try {
    const user = await User.findOne({ login_name });
    if (!user) {
      return response.status(400).json({ error: "không tìm thấy người dùng" });
    }

    if (user.password !== password) {
      return response.status(400).json({ error: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { userId: user._id, login_name: user.login_name },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    response.json({
      token,
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        login_name: user.login_name,
      },
    });
  } catch (err) {
    response.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", authMiddleware, (request, response) => {
  response.json({ message: "Logged out successfully" });
});

module.exports = router;
module.exports.JWT_SECRET = JWT_SECRET;
