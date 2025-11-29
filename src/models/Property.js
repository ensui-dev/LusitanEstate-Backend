const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a property title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  propertyType: {
    type: String,
    required: [true, 'Please specify property type'],
    enum: [
      'apartment', 'house', 'villa', 'townhouse', 'condo',
      'land', 'commercial', 'office', 'warehouse', 'retail',
      'farm', 'garage', 'building', 'penthouse', 'studio'
    ]
  },
  status: {
    type: String,
    required: true,
    enum: ['for-sale', 'for-rent', 'sold', 'rented', 'pending', 'draft'],
    default: 'draft'
  },
  // Admin approval status
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please provide street address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    district: {
      type: String,
      required: [true, 'Please provide district'],
      enum: [
        'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
        'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
        'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
        'Viana do Castelo', 'Vila Real', 'Viseu',
        'Açores', 'Madeira'
      ]
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide zip code'],
      match: [/^\d{4}-\d{3}$/, 'Please provide a valid Portuguese zip code (e.g., 1000-001)']
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      default: 'Portugal'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative']
  },
  // Portuguese market uses square meters, not square feet
  squareMeters: {
    type: Number,
    required: [true, 'Please provide area in square meters'],
    min: [0, 'Area cannot be negative']
  },
  // Keep squareFeet for compatibility, can be auto-calculated
  squareFeet: {
    type: Number,
    min: [0, 'Square feet cannot be negative']
  },
  yearBuilt: {
    type: Number,
    min: [1800, 'Year built seems too old'],
    max: [new Date().getFullYear() + 1, 'Year built cannot be in the future']
  },
  // Portuguese Energy Certificate (Certificado Energético) - Required by law
  energyCertificate: {
    rating: {
      type: String,
      enum: ['A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'Isento', 'Pendente'],
      default: 'Pendente'
    },
    validUntil: Date,
    certificateNumber: String
  },
  // Property condition
  condition: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'needs-renovation', 'under-construction'],
    default: 'good'
  },
  // Parking
  parkingSpaces: {
    type: Number,
    default: 0,
    min: [0, 'Parking spaces cannot be negative']
  },
  hasGarage: {
    type: Boolean,
    default: false
  },
  // Portuguese specific features
  features: [{
    type: String,
    trim: true,
    enum: [
      'elevator', 'balcony', 'terrace', 'garden', 'pool',
      'air-conditioning', 'central-heating', 'fireplace',
      'equipped-kitchen', 'furnished', 'storage-room',
      'laundry-room', 'security-system', 'video-intercom',
      'double-glazing', 'solar-panels', 'sea-view',
      'mountain-view', 'city-view', 'river-view',
      'wheelchair-accessible', 'pet-friendly', 'concierge',
      'gym', 'sauna', 'tennis-court', 'playground'
    ]
  }],
  // Images and media
  images: {
    type: [{
      url: {
        type: String,
        required: [true, 'Image URL is required']
      },
      caption: String,
      key: String, // S3 key for deletion
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    validate: {
      validator: function (images) {
        return images && images.length > 0;
      },
      message: 'At least one property image is required'
    }
  },
  virtualTourUrl: String,
  videoUrl: String,
  // Floor plans
  floorPlans: [{
    url: String,
    description: String
  }],
  // Financial information for buyers
  condominiumFee: {
    type: Number,
    min: 0,
    default: 0
  },
  imt: {
    // IMT = Imposto Municipal sobre Transmissões (Property Transfer Tax)
    estimated: Number,
    rate: Number
  },
  // References
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency'
  },
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  // Featured/Premium listing
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  // SEO
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  metaDescription: String,
  metaKeywords: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date
}, {
  timestamps: true
});

// Pre-save hook to auto-calculate squareFeet from squareMeters
propertySchema.pre('save', function (next) {
  if (this.squareMeters && !this.squareFeet) {
    // 1 square meter = 10.764 square feet
    this.squareFeet = Math.round(this.squareMeters * 10.764);
  }

  // Auto-generate slug from title if not provided
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Add unique identifier to avoid duplicates
    this.slug = `${this.slug}-${this._id.toString().slice(-6)}`;
  }

  next();
});

// Index for search optimization
propertySchema.index({ 'address.city': 1, 'address.district': 1, status: 1, propertyType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ approvalStatus: 1, status: 1 });
propertySchema.index({ agency: 1, status: 1 });
propertySchema.index({ agent: 1, status: 1 });

propertySchema.index({ isFeatured: -1, createdAt: -1 });

// Text index for search
propertySchema.index({
  title: 'text',
  description: 'text',
  'address.city': 'text',
  'address.district': 'text'
});

module.exports = mongoose.model('Property', propertySchema);
