const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Site Information
  siteName: {
    type: String,
    default: 'Portuguese Real Estate CMS'
  },
  siteDescription: {
    type: String,
    default: 'Professional real estate listing platform for Portugal'
  },
  siteLogo: String,
  siteFavicon: String,
  contactEmail: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  contactPhone: String,
  supportEmail: String,

  // SEO Settings
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    googleAnalyticsId: String,
    facebookPixelId: String,
    googleTagManagerId: String
  },

  // Social Media
  socialMedia: {
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String,
    youtube: String
  },

  // Email Settings
  email: {
    provider: {
      type: String,
      enum: ['smtp', 'sendgrid', 'mailgun', 'ses'],
      default: 'smtp'
    },
    fromEmail: String,
    fromName: String,
    replyTo: String
  },

  // Property Listing Settings
  propertySettings: {
    requireApproval: {
      type: Boolean,
      default: true
    },
    autoPublish: {
      type: Boolean,
      default: false
    },
    maxImagesPerListing: {
      type: Number,
      default: 20,
      min: 1,
      max: 50
    },
    featuredListingDuration: {
      type: Number,
      default: 30, // days
      min: 1
    },
    allowedPropertyTypes: [{
      type: String
    }],
    requireEnergyCertificate: {
      type: Boolean,
      default: true
    }
  },

  // Subscription/Payment Settings
  subscription: {
    enableSubscriptions: {
      type: Boolean,
      default: true
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    plans: {
      free: {
        enabled: {
          type: Boolean,
          default: true
        },
        maxListings: {
          type: Number,
          default: 10
        },
        maxAgents: {
          type: Number,
          default: 2
        },
        price: {
          type: Number,
          default: 0
        }
      },
      basic: {
        enabled: {
          type: Boolean,
          default: true
        },
        maxListings: {
          type: Number,
          default: 50
        },
        maxAgents: {
          type: Number,
          default: 5
        },
        price: {
          type: Number,
          default: 49.99
        }
      },
      premium: {
        enabled: {
          type: Boolean,
          default: true
        },
        maxListings: {
          type: Number,
          default: 200
        },
        maxAgents: {
          type: Number,
          default: 15
        },
        price: {
          type: Number,
          default: 149.99
        }
      },
      enterprise: {
        enabled: {
          type: Boolean,
          default: true
        },
        maxListings: {
          type: Number,
          default: -1 // unlimited
        },
        maxAgents: {
          type: Number,
          default: -1 // unlimited
        },
        price: {
          type: Number,
          default: 499.99
        }
      }
    }
  },

  // Agent Settings
  agentSettings: {
    requireVerification: {
      type: Boolean,
      default: true
    },
    autoVerify: {
      type: Boolean,
      default: false
    },
    requireLicense: {
      type: Boolean,
      default: true
    }
  },

  // Agency Settings
  agencySettings: {
    requireVerification: {
      type: Boolean,
      default: true
    },
    requireAMILicense: {
      type: Boolean,
      default: true
    }
  },

  // Notification Settings
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    newPropertyAlert: {
      type: Boolean,
      default: true
    },
    newInquiryAlert: {
      type: Boolean,
      default: true
    },
    newReviewAlert: {
      type: Boolean,
      default: true
    },
    adminNotifications: {
      type: Boolean,
      default: true
    }
  },

  // Map Settings
  map: {
    provider: {
      type: String,
      enum: ['google', 'mapbox', 'openstreetmap'],
      default: 'google'
    },
    apiKey: String,
    defaultCenter: {
      latitude: {
        type: Number,
        default: 38.7223 // Lisbon coordinates
      },
      longitude: {
        type: Number,
        default: -9.1393
      }
    },
    defaultZoom: {
      type: Number,
      default: 12,
      min: 1,
      max: 20
    }
  },

  // File Upload Settings
  fileUpload: {
    maxFileSize: {
      type: Number,
      default: 5242880 // 5MB in bytes
    },
    allowedImageTypes: {
      type: [String],
      default: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    },
    allowedDocumentTypes: {
      type: [String],
      default: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
  },

  // Localization
  localization: {
    defaultLanguage: {
      type: String,
      default: 'pt'
    },
    availableLanguages: {
      type: [String],
      default: ['pt', 'en']
    },
    timezone: {
      type: String,
      default: 'Europe/Lisbon'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },

  // Maintenance Mode
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'We are currently performing scheduled maintenance. Please check back soon.'
    },
    allowedIPs: [String]
  },

  // Terms and Legal
  legal: {
    termsAndConditionsUrl: String,
    privacyPolicyUrl: String,
    cookiePolicyUrl: String,
    gdprCompliance: {
      type: Boolean,
      default: true
    }
  },

  // System
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
