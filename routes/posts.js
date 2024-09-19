const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
router.post(
  "/",
  authenticateToken,
  upload.array("photos", 5),
  postController.createPost
);

router.put(
  "/:id",
  authenticateToken,
  upload.array("photos", 5),
  postController.updatePost
);

router.delete("/:id", authenticateToken, postController.deletePost);

router.get("/:id", postController.getPost);

router.get("/", postController.getAllPosts);

module.exports = router;
