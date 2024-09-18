const Category = require("../models/category");

const categoryController = {
  async createCategory(req, res) {
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
        res.status(400).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({ message: "Error creating category", error: error.message });
      }
    }
  },

  async getCategories(req, res) {
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
        paginationInfo.next = { page: page + 1, limit: limit };
      }
      if (startIndex > 0) {
        paginationInfo.previous = { page: page - 1, limit: limit };
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
  },
  async updateCategory(req, res) {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
        },
        { new: true, runValidators: true }
      );
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json(updatedCategory);
    } catch (error) {
      if (error.code === 11000) {
        res
          .status(400)
          .json({ message: "A category with this name already exists." });
      } else if (error.name === "ValidationError") {
        res.status(400).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({ message: "Error updating category", error: error.message });
      }
    }
  },
  async deleteCategory(req, res) {
    try {
      const deletedCategory = await Category.findByIdAndDelete(req.params.id);

      if (!deletedCategory) {
        return res.status(403).json("Category not found!");
      }
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting category", error: error.message });
    }
  },
};

module.exports = categoryController;
