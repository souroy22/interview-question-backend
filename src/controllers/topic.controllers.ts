import { Request, Response } from "express";
import Category from "../models/Category.model";
import { paginate } from "../utils/pagination";
import slugify from "slugify";
import ShortUniqueId from "short-unique-id";
import getUserData from "../utils/getUserByEmail";
import { ObjectId } from "mongoose";
import Topic from "../models/Topic.model";

const topicControllers = {
  createTopic: async (req: Request, res: Response) => {
    try {
      const { name, categorySlug } = req.body;
      const verified = req.user.user.role === "SUPER_ADMIN";
      let slug = slugify(name, { lower: true });
      const isExist = await Topic.findOne({ slug });
      if (isExist) {
        const uid = new ShortUniqueId({ length: 6 });
        slug += uid.rnd();
      }
      const category = await Category.findOne({ slug: categorySlug });
      if (!category) {
        return res.status(404).json({ error: "No category found!" });
      }
      const newTopic = new Topic({
        name,
        verified,
        slug,
        createdBy: req.user.user.id,
        category: category._id,
      });
      await newTopic.save();
      return res.status(200).json({
        name: newTopic.name,
        slug: newTopic.slug,
        verified: newTopic.verified,
        canModify: true,
        category: { name: category.name, slug: category.slug },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  getTopics: async (req: Request, res: Response) => {
    try {
      const { searchValue, isVerified } = req.query;
      const { categorySlug } = req.params;
      const category = await Category.findOne({ slug: categorySlug });
      if (!category) {
        return res.status(404).json({ error: "No category found!" });
      }
      const query: any = { category: category._id };
      const trimmedSearchValue = searchValue?.toString().trim();
      if (trimmedSearchValue) {
        query["name"] = { $regex: trimmedSearchValue, $options: "i" };
      }
      if (isVerified !== undefined) {
        query["verified"] = isVerified;
      }

      const user = await getUserData(req.user.user.email);
      const reqQuery = Topic.find(query, {
        name: 1,
        slug: 1,
        createdBy: 1,
        verified: 1,
        _id: 0,
      });
      let topics = await paginate(reqQuery, req.pagination);

      const modifiedTopics = topics.data.map((topic: any) => {
        // Extract category data from `_doc` to avoid Mongoose metadata
        const topicData = topic._doc || topic;

        // Ensure that user and user.id are properly defined
        const canModify =
          user.role === "SUPER_ADMIN" ||
          topicData.createdBy.toString() === req.user?.user?.id;

        return {
          ...topicData,
          category: { name: category.name, slug: category.slug },
          canModify,
        };
      });
      return res.status(200).json({ ...topics, data: modifiedTopics });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  updateTopic: async (req: Request, res: Response) => {
    try {
      const { name, verified, categorySlug } = req.body;
      const { slug } = req.params;

      const updateFields: {
        name?: string;
        verified?: boolean;
        category?: ObjectId;
      } = {};
      if (name) {
        updateFields["name"] = name.toString();
      }
      if (verified !== undefined) {
        updateFields["verified"] = Boolean(verified);
      }
      const isExist = await Topic.findOne({ slug });
      if (!isExist) {
        return res.status(404).json({ error: "No category found!" });
      }
      const category = await Category.findOne({ slug: categorySlug });
      if (categorySlug) {
        if (!category) {
          return res.status(404).json({ error: "No category found!" });
        }
        updateFields["category"] = category._id as ObjectId;
      }
      const user = await getUserData(req.user.user.email);
      const canModify =
        user.role === "SUPER_ADMIN" ||
        isExist.createdBy.toString() === req.user?.user?.id;
      if (!canModify) {
        return res.status(403).json({ error: "Access Denied" });
      }
      const updatedTopic = await Topic.findOneAndUpdate(
        { slug },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedTopic) {
        return res.status(404).json({ error: "Topic not found" });
      }

      return res.status(200).json({
        name: updatedTopic.name,
        slug: updatedTopic.slug,
        verified: updatedTopic.verified,
        canModify: canModify,
        category: { name: category.name, slug: category.slug },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  deleteTopic: async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const isExist = await Topic.findOne({ slug });
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
      const deletedTopic = await Topic.findOneAndDelete({ slug });

      if (!deletedTopic) {
        return res.status(404).json({ error: "Topic not found" });
      }
      return res.status(200).json({
        msg: "Topic deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
};

export default topicControllers;
