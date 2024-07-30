const Comment = require("../models/Comment");

// Create Comment
exports.createComment = async (req, res) => {
  const { post_id, content } = req.body;
  const author_id = req.user.id; // Extract the user ID from the authenticated request
  try {
    const newComment = new Comment({
      post_id,
      content,
      author_id,
    });
    await newComment.save();
    const savedComment = await Comment.findById(newComment._id).populate(
      "author_id",
      "username email"
    );
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read Comments by Author
exports.getAuthorComments = async (req, res) => {
  try {
    const { author_id } = req.params;
    const comments = await Comment.find({
      author_id,
    }).populate("author_id", "username email");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read Single Comment
exports.getCommentsByPostId = async (req, res) => {
  try {
    const { post_id } = req.params;
    const comments = await Comment.find({ post_id }).populate(
      "author_id",
      "username email"
    );
    if (!comments || comments.length === 0)
      return res.status(404).json({ error: "No comments found for this post" });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Comment
exports.updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the authenticated user is the author of the comment
    if (comment.author_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    comment.content = req.body.content;
    await comment.save();
    comment = await Comment.findById(req.params.id).populate(
      "author_id",
      "username email"
    );
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the authenticated user is the author of the comment
    if (comment.author_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
