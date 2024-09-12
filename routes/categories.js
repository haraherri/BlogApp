const router = require("express").Router();
const Category = require("../models/category");

//create category
router.post("/", async (req, res) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
    });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res
        .status(400)
        .json({ message: "A category with this name already exists." });
    } else if (error.name === "ValidationError") {
      res
        .status(400)
        .json({ message: "Category name is required.", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Error creating category", error: error.message });
    }
  }
});

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const totalCategories = await Category.countDocuments();
    const categories = await Category.find()
      .skip(startIndex)
      .limit(limit)
      .sort({ name: 1 });

    const paginationInfo = {};
    if (endIndex < totalCategories) {
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
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      categoriesPerPage: limit,
      paginationInfo,
      categories,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
});
module.exports = router;
