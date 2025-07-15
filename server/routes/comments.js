const express = require('express');
const Joi = require('joi');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation schema
const commentSchema = Joi.object({
  content: Joi.string().max(1000).required(),
  post: Joi.string().required(),
  parentComment: Joi.string().optional()
});

// Get comments for a post
const mongoose = require('mongoose');

router.get('/post/:postId', async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // 1. Validate postId as a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid post ID format' });
  }

  try {
    // 2. Find comments
    const comments = await Comment.find({ 
      post: postId,
      parentComment: null,
      isApproved: true
    })
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username avatar' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Comment.countDocuments({ 
      post: postId,
      parentComment: null,
      isApproved: true
    });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Create new comment
router.post('/', auth, async (req, res) => {
  try {
    const { error } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if post exists and comments are enabled
    const post = await Post.findById(req.body.post);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.isCommentEnabled) {
      return res.status(403).json({ message: 'Comments are disabled for this post' });
    }

    const comment = new Comment({
      ...req.body,
      author: req.user._id
    });

    await comment.save();
    await comment.populate('author', 'username avatar');

    res.status(201).json({ 
      message: 'Comment created successfully', 
      comment 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update comment
router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    comment.content = req.body.content;
    await comment.save();
    await comment.populate('author', 'username avatar');

    res.json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike comment
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({ 
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      likesCount: comment.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Get all posts (with optional filters and pagination)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'published',  // Change to 'all' if you want to show everything by default
      category,
      search,
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.categories = category;
    }

    // Author filter
    if (author) {
      query.author = author;
    }

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'author', select: 'username avatar' },
        { path: 'categories', select: 'name slug color' }
      ]
    };

    const posts = await Post.paginate(query, options);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;