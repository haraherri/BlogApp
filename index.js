require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const connection = require("./config/database");
const authRoute = require("./routes/auth");
const authUser = require("./routes/user");
const authPost = require("./routes/posts");
const authCat = require("./routes/categories");
const PORT = process.env.PORT || 8888;

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
