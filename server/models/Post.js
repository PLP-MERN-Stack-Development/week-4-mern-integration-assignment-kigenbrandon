const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    maxlength: 300,
    trim: true
  },
  featuredImage: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  medicalDisclaimer: {
    type: Boolean,
    default: true
  },
  department: {
    type: String,
    enum: [
      'cardiology', 'neurology', 'pediatrics', 'orthopedics',
      'oncology', 'emergency', 'general', 'surgery', 'radiology', 'pathology'
    ],
    default: 'general'
  },
  readingTime: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isCommentEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Slug generation with uniqueness check
postSchema.pre('validate', async function (next) {
  if (this.isNew || this.isModified('title')) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (await mongoose.models.Post.exists({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }

  // Set publishedAt if publishing
  if (this.isModified('status') && this.status === 'published') {
    this.publishedAt = new Date();
  }

  // Auto-generate excerpt
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/<[^>]+>/g, '');
    if (plainText.length > 0) {
      this.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }
  }

  next();
});

// Full-text search
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Pagination
postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);
