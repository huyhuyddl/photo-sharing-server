const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.get("/photosOfUser/:id", async (request, response) => {
  const userId = request.params.id;

  try {
    const photos = await Photo.find({
      user_id: new mongoose.Types.ObjectId(userId),
    });

    if (!photos || photos.length === 0) {
      return response.json([]);
    }

    const photosWithComments = await Promise.all(
      photos.map(async (photo) => {
        const photoObj = photo.toObject();

        const commentsWithUser = await Promise.all(
          (photoObj.comments || []).map(async (comment) => {
            const user = await User.findById(
              comment.user_id,
              "_id first_name last_name",
            );
            return {
              comment: comment.comment,
              date_time: comment.date_time,
              _id: comment._id,
              user: user,
            };
          }),
        );

        return {
          _id: photoObj._id,
          user_id: photoObj.user_id,
          file_name: photoObj.file_name,
          date_time: photoObj.date_time,
          comments: commentsWithUser,
        };
      }),
    );

    response.json(photosWithComments);
  } catch (err) {
    console.log(err); // thêm dòng này để debug
    response.status(500).send("Lỗi server");
  }
});
router.post("/new", upload.single("photo"), async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ error: "No file uploaded" });
  }

  try {
    const newPhoto = await Photo.create({
      file_name: request.file.filename,
      date_time: new Date(),
      user_id: request.user.userId,
    });

    const photoObj = newPhoto.toObject();

    response.status(201).json({
      _id: photoObj._id,
      file_name: photoObj.file_name,
      date_time: photoObj.date_time,
      user_id: photoObj.user_id,
      comments: [],
    });
  } catch (err) {
    console.log(err);
    response.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
