const Post = require("../models/Post");

// Create a new post
exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = new Post({ title, content, author_id: req.user.id });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all posts by the authenticated author
exports.getAuthorPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author_id: req.user.id }).populate(
      "author_id",
      "username email"
    );
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts by author", error });
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author_id", "username email");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single post by post_id
exports.getPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await Post.findById(post_id).populate(
      "author_id",
      "username email"
    );
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a post by post_id
exports.updatePost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const { post_id } = req.params;
    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.author_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.updated_at = Date.now();

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a post by post_id
exports.deletePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
