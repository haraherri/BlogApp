const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  authenticateToken,
  checkRole(["admin"]),
  categoryController.createCategory
);

router.get("/", categoryController.getCategories);

router.put(
  "/:id",
  authenticateToken,
  checkRole(["admin"]),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authenticateToken,
  checkRole(["admin"]),
  categoryController.deleteCategory
);

module.exports = router;
