const bcrypt = require("bcrypt");
const User = require("../models/user");
const Post = require("../models/post");
const path = require("path");
const fs = require("fs");

const userController = {
  // Update user
  updateUser: async (req, res) => {
    try {
      const userToUpdate = await User.findById(req.params.id);
      if (!userToUpdate) {
        return res.status(404).json({ message: "User not found" });
      }

      if (req.user.id !== req.params.id && req.user.role !== "admin") {
        return res.status(403).json({
          message:
            "You can update only your account or you need to be an admin",
        });
      }

      let updateData = req.body;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(req.body.password, salt);
      }

      if (req.file) {
        updateData.profilePic = `/uploads/${req.file.filename}`;

        if (userToUpdate.profilePic && userToUpdate.profilePic !== "") {
          const oldImagePath = path.join(
            __dirname,
            "..",
            userToUpdate.profilePic
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      ).select("-password");

      res.status(200).json(updatedUser);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating user", error: error.message });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await Post.deleteMany({ username: user.username });
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "User has been deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting user", error: error.message });
    }
  },

  // Get User
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching user", error: error.message });
    }
  },

  // Get all Users with Pagination
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const skip = (page - 1) * limit;

      const users = await User.find({})
        .select("-password")
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
  },
};

module.exports = userController;
