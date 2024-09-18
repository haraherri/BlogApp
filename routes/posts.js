const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");

router.post("/", authenticateToken, postController.createPost);

router.put("/:id", authenticateToken, postController.updatePost);

router.delete("/:id", authenticateToken, postController.deletePost);

router.get("/:id", postController.getPost);

router.get("/", postController.getAllPosts);

module.exports = router;
