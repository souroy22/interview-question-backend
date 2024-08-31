import { Request, Response } from "express";
import Category from "../models/Category.model";
import { paginate } from "../utils/pagination";
import slugify from "slugify";
import ShortUniqueId from "short-unique-id";
import getUserData from "../utils/getUserByEmail";

const categoryControllers = {
  createCategory: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const verified = req.user.user.role === "SUPER_ADMIN";
      let slug = slugify(name, { lower: true });
      const isExist = await Category.findOne({ slug });
      if (isExist) {
        const uid = new ShortUniqueId({ length: 6 });
        slug += uid.rnd();
      }
      const newCategory = new Category({
        name,
        verified,
        slug,
        createdBy: req.user.user.id,
      });
      await newCategory.save();
      return res.status(200).json({
        name: newCategory.name,
        slug: newCategory.slug,
        verified: newCategory.verified,
        canModify: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  getCategories: async (req: Request, res: Response) => {
    try {
      const { searchValue, isVerified } = req.query;
      const query: any = {};
      const trimmedSearchValue = searchValue?.toString().trim();
      if (trimmedSearchValue) {
        query["name"] = { $regex: trimmedSearchValue, $options: "i" };
      }
      if (isVerified !== undefined) {
        query["verified"] = isVerified;
      }

      const user = await getUserData(req.user.user.email);
      const reqQuery = Category.find(query, {
        name: 1,
        slug: 1,
        createdBy: 1,
        verified: 1,
        _id: 0,
      });
      let categories = await paginate(reqQuery, req.pagination);

      const modifiedCategories = categories.data.map((category: any) => {
        // Extract category data from `_doc` to avoid Mongoose metadata
        const categoryData = category._doc || category;

        // Ensure that user and user.id are properly defined
        const canModify =
          user.role === "SUPER_ADMIN" ||
          categoryData.createdBy.toString() === req.user?.user?.id; // Convert ObjectId to string for comparison

        return {
          ...categoryData,
          canModify,
        };
      });
      return res.status(200).json({ ...categories, data: modifiedCategories });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  updateCategory: async (req: Request, res: Response) => {
    try {
      const { name, verified } = req.body;
      const { slug } = req.params;

      const updateFields: { name?: string; verified?: boolean } = {};
      if (name) {
        updateFields["name"] = name.toString();
      }
      if (verified !== undefined) {
        updateFields["verified"] = Boolean(verified);
      }
      const isExist = await Category.findOne({ slug });
      if (!isExist) {
        return res.status(404).json({ error: "No category found!" });
      }
      const user = await getUserData(req.user.user.email);
      const canModify =
        user.role === "SUPER_ADMIN" ||
        isExist.createdBy.toString() === req.user?.user?.id;
      if (!canModify) {
        return res.status(403).json({ error: "Access Denied" });
      }
      const updatedCategory = await Category.findOneAndUpdate(
        { slug },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.status(200).json({
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        verified: updatedCategory.verified,
        canModify: canModify,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  deleteCategory: async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const isExist = await Category.findOne({ slug });
      if (!isExist) {
        return res.status(404).json({ error: "No category found!" });
      }
      const user = await getUserData(req.user.user.email);
      const canDelete =
        user.role === "SUPER_ADMIN" ||
        isExist.createdBy.toString() === req.user?.user?.id;
      if (!canDelete) {
        return res.status(403).json({ error: "Access Denied" });
      }
      const deletedCategory = await Category.findOneAndDelete({ slug });

      if (!deletedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.status(200).json({
        msg: "Category deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
};

export default categoryControllers;
