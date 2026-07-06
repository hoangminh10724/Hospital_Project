const Blog = require('../models/Blog');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  const blogs = await Blog.find();
  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});

// @desc    Get single blog
// @route   GET /api/v1/blogs/:id
// @access  Public
exports.getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Create new blog
// @route   POST /api/v1/blogs
// @access  Private
exports.createBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.create(req.body);
  res.status(201).json({
    success: true,
    data: blog
  });
});

// @desc    Update blog
// @route   PUT /api/v1/blogs/:id
// @access  Private
exports.updateBlog = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Delete blog
// @route   DELETE /api/v1/blogs/:id
// @access  Private
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add comment to blog
// @route   POST /api/v1/blogs/:id/comments
// @access  Public
exports.addComment = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  blog.comments.push(req.body);
  await blog.save();

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Get blog comments
// @route   GET /api/v1/blogs/:id/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    count: blog.comments.length,
    data: blog.comments
  });
});
