const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề bài viết là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  summary: {
    type: String,
    required: [true, 'Tóm tắt bài viết là bắt buộc'],
    maxlength: [500, 'Tóm tắt không được vượt quá 500 ký tự']
  },
  content: {
    type: String,
    required: [true, 'Nội dung bài viết là bắt buộc']
  },
  image: {
    type: String,
    required: [true, 'Hình ảnh bài viết là bắt buộc']
  },
  author: {
    type: String,
    required: [true, 'Tác giả bài viết là bắt buộc']
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  comments: [{
    name: String,
    email: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để cập nhật updatedAt trước khi lưu
BlogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
