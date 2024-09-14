const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const Category = require("../models/category");

router.post("/", async (req, res) => {
  try {
    const userExists = await User.findOne({ username: req.body.username });

    if (!userExists) {
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
      ...req.body,
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
});

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        // Xử lý categories nếu có
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
          {
            $set: req.body,
          },
          {
            new: true,
          }
        );
        res.status(200).json(updatePost);
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(401).json("You can update only your post!");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.username === req.body.username) {
      try {
        await post.deleteOne();
        res.status(200).json("Post has been deleted!");
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error deleting post", error: error.message });
      }
    } else {
      res.status(401).json("You can delete only your post!");
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json("Post not found!");
  }
});
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("categories");
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const totalPosts = await Post.countDocuments();
    const posts = await Post.find()
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    const paginationInfo = {};
    if (endIndex < totalPosts) {
      paginationInfo.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      paginationInfo.previous = {
        page: page - 1,
        limit: limit,
      };
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
});
module.exports = router;
