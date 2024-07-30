const express = require("express");
const {
  createComment,
  getAuthorComments,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, createComment);
router.get("/author/:author_id", auth, getAuthorComments);
router.get("/:post_id", getCommentsByPostId);
router.put("/:id", auth, updateComment);
router.delete("/:id", auth, deleteComment);

module.exports = router;
