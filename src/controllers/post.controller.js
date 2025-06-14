import Post from "../models/post.model.js"; // Post model
import cloudinary from "../lib/cloudinary.js"; // Cloudinary for image upload

// Create a new post
export const createPost = async (req, res) => {
  const { title, content, image } = req.body;
  const authorId = req.user._id;

  try {
    let imageUrl = null;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newPost = new Post({
      title,
      content,
      authorId,
      image: imageUrl,
    });

    await newPost.save();

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.log("Error in createPost controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("authorId", "fullName email profilePic").sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getPosts controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get a single post
export const getPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate("authorId", "fullName email profilePic");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in getPost controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a post
export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content, image } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only allow the author to update their post
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this post" });
    }

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      post.image = uploadResponse.secure_url;
    }

    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();

    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    console.log("Error in updatePost controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only allow the author to delete their post
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the author of this post to delete this post" });
    }

    await Post.deleteOne({ _id: postId });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
