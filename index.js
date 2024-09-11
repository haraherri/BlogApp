require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connection = require("./config/database");
const authRoute = require("./routes/auth");
const authUser = require("./routes/user");
const authPost = require("./routes/posts");
const PORT = process.env.PORT || 8888;

app.use(express.json());

app.use("/auth", authRoute);
app.use("/users", authUser);
app.use("/posts", authPost);

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
