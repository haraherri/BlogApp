require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const connection = require("./config/database");
const authRoute = require("./routes/auth");
const authUser = require("./routes/user");
const authPost = require("./routes/posts");
const authCat = require("./routes/categories");
const multer = require("multer");
const PORT = process.env.PORT || 8888;

app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Only allowed to upload image files!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

app.post(
  "/upload",
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).send("No files have been uploaded.");
    }
    res.status(200).json({
      message: "File upload successfully!",
      file: req.file,
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

app.use("/auth", authRoute);
app.use("/users", authUser);
app.use("/posts", authPost);
app.use("/categories", authCat);

(async () => {
  try {
    await connection();

    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(">>> Error connect to DB: ", error);
  }
})();
