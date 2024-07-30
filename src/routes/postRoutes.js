const express = require("express");
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  getAuthorPosts,
} = require("../controllers/postController");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticate, createPost); // Create a new post
router.get("/", getPosts); // Get all posts
router.get("/:post_id", getPost); // Get a single post by post_id
router.put("/:post_id", authenticate, updatePost); // Update a post by post_id
router.delete("/:post_id", authenticate, deletePost); // Delete a post by post_id
router.get("/author/me", authenticate, getAuthorPosts); // Get all posts by the authenticated author

module.exports = router;
