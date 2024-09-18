const Post = require("../models/post");
const User = require("../models/user");
const Category = require("../models/category");

const postController = {
  async createPost(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          message: "User not found. Cannot create post for non-existent user.",
        });
      }

      let categoryIds = [];
      if (req.body.categories && req.body.categories.length > 0) {
        for (let categoryName of req.body.categories) {
          let category = await Category.findOne({ name: categoryName });
          if (!category) {
            category = new Category({ name: categoryName });
            await category.save();
          }
          categoryIds.push(category._id);
        }
      }

      const newPost = new Post({
        title: req.body.title,
        desc: req.body.desc,
        photo: req.body.photo,
        userId: req.user.id,
        categories: categoryIds,
      });
      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (error) {
      if (error.code === 11000) {
        res
          .status(400)
          .json({ message: "A post with this title already exists." });
      } else {
        res
          .status(500)
          .json({ message: "Error creating post", error: error.message });
      }
    }
  },

  async updatePost(req, res) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found!" });
      }

      if (post.userId.toString() === req.user.id || req.user.role === "admin") {
        if (req.body.categories) {
          let categoryIds = [];
          for (let categoryName of req.body.categories) {
            let category = await Category.findOne({ name: categoryName });
            if (!category) {
              category = new Category({ name: categoryName });
              await category.save();
            }
            categoryIds.push(category._id);
          }
          req.body.categories = categoryIds;
        }
        const updatePost = await Post.findByIdAndUpdate(
          req.params.id,
          { $set: req.body },
          { new: true }
        );
        res.status(200).json(updatePost);
      } else {
        res.status(403).json("You can only update your own posts!");
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating post", error: error.message });
    }
  },

  async deletePost(req, res) {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.userId.toString() === req.user.id || req.user.role === "admin") {
        await post.deleteOne();
        res.status(200).json("Post has been deleted!");
      } else {
        res.status(403).json("You can only delete your own posts!");
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting post", error: error.message });
    }
  },

  async getPost(req, res) {
    try {
      const post = await Post.findById(req.params.id)
        .populate("categories")
        .populate("userId", "username");
      res.status(200).json(post);
    } catch (error) {
      res.status(404).json("Post not found!");
    }
  },

  async getAllPosts(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
      const totalPosts = await Post.countDocuments();
      const posts = await Post.find()
        .skip(startIndex)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("userId", "username")
        .populate("categories");

      const paginationInfo = {};
      if (endIndex < totalPosts) {
        paginationInfo.next = { page: page + 1, limit: limit };
      }
      if (startIndex > 0) {
        paginationInfo.previous = { page: page - 1, limit: limit };
      }

      res.status(200).json({
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        postsPerPage: limit,
        paginationInfo,
        posts,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching posts", error: error.message });
    }
  },
};

module.exports = postController;
