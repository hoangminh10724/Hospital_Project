const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  getComments
} = require('../controllers/blogController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getBlogs)
  .post(protect, authorize('admin'), createBlog);

router
  .route('/:id')
  .get(getBlog)
  .put(protect, authorize('admin'), updateBlog)
  .delete(protect, authorize('admin'), deleteBlog);

router
  .route('/:id/comments')
  .get(getComments)
  .post(addComment);

module.exports = router;
