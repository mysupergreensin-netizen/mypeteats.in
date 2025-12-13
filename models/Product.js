import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9-]+$/.test(v);
      },
      message: 'SKU must contain only uppercase letters, numbers, and hyphens'
    }
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title must not exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    index: true,
    lowercase: true
  },
  description: {
    type: String,
    default: '',
    maxlength: [5000, 'Description must not exceed 5000 characters']
  },
  price_cents: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be non-negative'],
    max: [999999999, 'Price exceeds maximum allowed value'],
    validate: {
      validator: Number.isInteger,
      message: 'Price must be an integer (cents)'
    }
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
    maxlength: [3, 'Currency code must be 3 characters']
  },
  inventory: {
    type: Number,
    default: 0,
    min: [0, 'Inventory cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Inventory must be an integer'
    }
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        if (!Array.isArray(v)) return false;
        return v.every(url => {
          if (typeof url !== 'string' || !url.trim()) return false;
          // Accept both absolute URLs and relative paths
          try {
            // Try as absolute URL first
            new URL(url);
            return true;
          } catch {
            // If that fails, check if it's a valid relative path
            // Relative paths should start with / or be a valid path
            return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
          }
        });
      },
      message: 'All image URLs must be valid URLs or relative paths'
    }
  },
  categories: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(cat => typeof cat === 'string' && cat.trim().length > 0);
      },
      message: 'Categories must be non-empty strings'
    }
  },
  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  published: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Auto-generate slug from title if not provided
productSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
  }
  
  // Update slug if title changed
  if (this.isModified('title') && !this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  next();
});

// Create indexes
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ published: 1 });
productSchema.index({ created_at: -1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;

