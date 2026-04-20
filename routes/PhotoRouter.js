const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const mongoose = require("mongoose");

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
module.exports = router;
