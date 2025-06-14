import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createPost); // Create a new post
router.get("/", getPosts); // Get all posts
router.get("/:postId", getPost); // Get a single post
router.put("/:postId", protectRoute, updatePost); // Update a post
router.delete("/:postId", protectRoute, deletePost); // Delete a post

export default router;
