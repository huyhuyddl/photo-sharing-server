const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const dbConnect = require("./db/dbConnect");
const authMiddleware = require("./routes/authMiddleware");
const User = require("./db/userModel");

const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");
const CommentRouter = require("./routes/CommentRouter");

dbConnect();

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "uploads")));

app.use("/admin", AdminRouter);

app.post("/user", async (request, response) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

  if (!login_name || !login_name.trim()) {
    return response.status(400).json({ error: "Tên đăng nhập không được để trống" });
  }
  if (!password) {
    return response.status(400).json({ error: "Mật khẩu không được để trống" });
  }
  if (!first_name || !first_name.trim()) {
    return response.status(400).json({ error: "Tên không được để trống" });
  }
  if (!last_name || !last_name.trim()) {
    return response.status(400).json({ error: "Họ không được để trống" });
  }

  try {
    const existingUser = await User.findOne({ login_name: login_name.trim() });
    if (existingUser) {
      return response.status(400).json({ error: "Tên đăng nhập đã tồn tại" });
    }

    const newUser = new User({
      login_name: login_name.trim(),
      password: password,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    await newUser.save();

    response.json({
      user: {
        _id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        login_name: newUser.login_name,
      },
      login_name: newUser.login_name,
    });
  } catch (err) {
    response.status(500).json({ error: "Lỗi server" });
  }
});

app.use("/user", authMiddleware, UserRouter);
app.use("/photo", authMiddleware, PhotoRouter);
app.use("/commentsOfPhoto", CommentRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(3001, () => {
  console.log("server listening on port 3001");
});
