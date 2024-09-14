const router = require("express").Router();
const bcrypt = require("bcrypt");
const Post = require("../models/post");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/uploadMiddleware");
//update user
router.put("/:id", upload.single("profilePic"), async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      let updateData = req.body;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(req.body.password, salt);
      }

      if (req.file) {
        updateData.profilePic = `/uploads/${req.file.filename}`;

        const currentUser = await User.findById(req.params.id);
        if (currentUser.profilePic && currentUser.profilePic !== "") {
          const oldImagePath = path.join(
            __dirname,
            "..",
            currentUser.profilePic
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const updateUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );

      updateUser.password = undefined;

      res.status(200).json(updateUser);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating user", error: error.message });
    }
  } else {
    res.status(401).json("You can update only your account");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      try {
        await Post.deleteMany({ username: user.username });

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
      } catch (error) {
        res.status(500).json(error);
      }
    } catch (error) {
      res.status(404).json("User not found...");
    }
  } else {
    res.status(401).json("You can delete only your account!");
  }
});

//get User
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(400).json(error);
  }
});

//get all User and Pagnination

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const skip = (page - 1) * limit;

    const users = await User.find({}, "-password")
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await User.countDocuments();

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

module.exports = router;
