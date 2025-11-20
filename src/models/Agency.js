const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide agency name'],
    trim: true,
    unique: true,
    maxlength: [200, 'Agency name cannot be more than 200 characters']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide AMI license number'],
    unique: true,
    trim: true,
    // AMI = Associação de Mediadores Imobiliários (Portugal)
  },
  email: {
    type: String,
    required: [true, 'Please provide agency email'],
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
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
      default: 'Portugal'
    }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a manager to the agency']
  },
  agents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  }],
  totalProperties: {
    type: Number,
    default: 0
  },
  activeProperties: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    maxListings: {
      type: Number,
      default: 10
    },
    maxAgents: {
      type: Number,
      default: 2
    }
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    total: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search optimization
agencySchema.index({ name: 'text', description: 'text' });
agencySchema.index({ district: 1, isActive: 1, isVerified: 1 });

module.exports = mongoose.model('Agency', agencySchema);
