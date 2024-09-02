import { Request, Response } from "express";
import getUserData from "../utils/getUserByEmail";
import Question from "../models/Question.model";
import Topic from "../models/Topic.model";
import Category from "../models/Category.model";
import slugify from "slugify";
import ShortUniqueId from "short-unique-id";
import { paginate } from "../utils/pagination";

const questionControllers = {
  getAllQuestions: async (req: Request, res: Response) => {
    try {
      const { categorySlug, topicSlug, searchValue, verified } = req.query;
      let filter: any = {};
      if (categorySlug) {
        const category = await Category.findOne({
          slug: categorySlug as string,
        });
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
        const topics = await Topic.find({ category: category._id });
        filter.topic = { $in: topics.map((topic) => topic._id) };
      }
      if (topicSlug) {
        const topic = await Topic.findOne({ slug: topicSlug as string });
        if (!topic) {
          return res.status(404).json({ message: "Topic not found" });
        }
        filter.topic = topic._id;
      }

      if (searchValue) {
        filter.$or = [
          { title: { $regex: searchValue as string, $options: "i" } },
          { description: { $regex: searchValue as string, $options: "i" } },
        ];
      }

      if (verified !== undefined) {
        filter.verified = verified === "true";
      }

      const reqQuery = Question.find(filter).select({
        title: 1,
        description: 1,
        _id: 0,
        verified: 1,
        youtubeLink: 1,
        websiteLink: 1,
        type: 1,
        slug: 1,
        language: 1,
      });
      const questions = await paginate(reqQuery, req.pagination);
      return res.status(200).json(questions);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  getQuestionById: async (req: Request, res: Response) => {
    try {
      const { questionSlug } = req.params;
      const question = await Question.findOne({ slug: questionSlug })
        .select({
          title: 1,
          description: 1,
          _id: 0,
          verified: 1,
          youtubeLink: 1,
          websiteLink: 1,
          solution: 1,
          slug: 1,
          createdBy: 1,
          type: 1,
          topic: 1,
          language: 1,
        })
        .populate([
          { path: "createdBy", select: "name _id email" },
          {
            path: "topic",
            select: "name slug createdBy verified category -_id",
            populate: [
              { path: "category", select: "name slug -_id" },
              { path: "createdBy", select: "name _id email" },
            ],
          },
        ]);
      const user = await getUserData(req.user.user.email);
      const canModify =
        user.role === "SUPER_ADMIN" ||
        question.createdBy.toString() === req.user?.user?.id;
      const questionObject: any = question.toObject();
      questionObject.canModify = canModify;
      return res.status(200).json({ question: questionObject });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  createQuestion: async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        topicSlug,
        type,
        solution,
        youtubeLink,
        websiteLink,
        language,
      } = req.body;
      const topic = await Topic.findOne({ slug: topicSlug });
      if (!topic) {
        return res.status(404).json({ error: "No such topic found!" });
      }
      if (type.toString() !== "THEORY" && type.toString() !== "CODING") {
        return res.status(400).json({ error: "Wrong question type!" });
      }
      let slug = slugify(title.toString().slice(0, 20).trim(), { lower: true });
      const isExist = await Question.findOne({ slug });
      if (isExist) {
        const uid = new ShortUniqueId({ length: 6 });
        slug += uid.rnd();
      }
      const verified = req.user.user.role === "SUPER_ADMIN";
      const question = new Question({
        title,
        description,
        slug,
        createdBy: req.user.user.id,
        topic: topic._id,
        type,
        solution,
        youtubeLink,
        websiteLink,
        verified,
        language,
      });

      await question.save();
      return res.status(200).json(question);
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  updateQuestion: async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        topicSlug,
        type,
        solution,
        youtubeLink,
        websiteLink,
        verified,
        language,
      } = req.body;
      const { questionSlug } = req.params;
      const isExist = await Question.findOne({ slug: questionSlug });
      if (!isExist) {
        return res.status(404).json({ error: "No question found!" });
      }
      const topic = await Topic.findOne({ slug: topicSlug });
      if (!topic) {
        return res.status(404).json({ error: "No such topic found!" });
      }
      if (type.toString() !== "THEORY" && type.toString() !== "CODING") {
        return res.status(400).json({ error: "Wrong question type!" });
      }
      const user = await getUserData(req.user.user.email);
      const canModify =
        user.role === "SUPER_ADMIN" ||
        isExist.createdBy.toString() === req.user?.user?.id;
      if (!canModify) {
        return res.status(403).json({ error: "Access Denied" });
      }
      const updatedQuestion = await Question.findOneAndUpdate(
        { slug: questionSlug },
        {
          title,
          description,
          createdBy: req.user.user.id,
          topic: topic._id,
          type,
          solution,
          youtubeLink,
          websiteLink,
          verified,
          language,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
      return res.status(200).json({ question: updatedQuestion });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  deleteQuestion: async (req: Request, res: Response) => {
    try {
      const { questionSlug } = req.params;
      const isExist = await Question.findOne({ slug: questionSlug });
      if (!isExist) {
        return res.status(404).json({ error: "No question found!" });
      }
      const user = await getUserData(req.user.user.email);
      const canModify =
        user.role === "SUPER_ADMIN" ||
        isExist.createdBy.toString() === req.user?.user?.id;
      if (!canModify) {
        return res.status(403).json({ error: "Access Denied" });
      }
      const deletedQuestion = await Question.findOneAndDelete({
        slug: questionSlug,
      });

      if (!deletedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }

      return res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
};

export default questionControllers;
