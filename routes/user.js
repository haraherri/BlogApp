const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateToken,
  checkRole,
  checkAdminOrSelf,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Update user
router.put(
  "/:id",
  authenticateToken,
  checkAdminOrSelf,
  upload.single("profilePic"),
  userController.updateUser
);

// Delete user
router.delete(
  "/:id",
  authenticateToken,
  checkAdminOrSelf,
  userController.deleteUser
);

// Get User
router.get("/:id", authenticateToken, checkAdminOrSelf, userController.getUser);

// Get all Users with Pagination
router.get(
  "/",
  authenticateToken,
  checkRole(["admin"]),
  userController.getAllUsers
);

module.exports = router;
