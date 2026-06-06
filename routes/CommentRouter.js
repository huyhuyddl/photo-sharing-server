const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const authMiddleware = require("./authMiddleware");
const router = express.Router();

router.post("/:photo_id", authMiddleware, async (request, response) => {
  const { photo_id } = request.params;
  const { comment } = request.body;
  const userId = request.user.userId;

  if (!comment || !comment.trim()) {
    return response.status(400).json({ error: "Comment cannot be empty" });
  }

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return response.status(404).json({ error: "Photo not found" });
    }

    const newComment = {
      comment: comment.trim(),
      date_time: new Date(),
      user_id: userId,
    };

    photo.comments.push(newComment);
    await photo.save();

    const savedComment = photo.comments[photo.comments.length - 1];
    const user = await User.findById(userId, "_id first_name last_name");

    response.status(201).json({
      _id: savedComment._id,
      comment: savedComment.comment,
      date_time: savedComment.date_time,
      user: user,
    });
  } catch (err) {
    console.log(err);
    response.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
