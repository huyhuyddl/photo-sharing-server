const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

router.get("/list", async (request, response) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    response.json(users);
  } catch (err) {
    response.status(500).json({ error: "Lỗi server" });
  }
});

router.get("/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return response.status(400).send("Không tìm thấy người dùng");
    }
    response.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    });
  } catch (err) {
    response.status(400).send("ID không hợp lệ");
  }
});

module.exports = router;
