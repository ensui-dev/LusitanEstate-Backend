const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Validate AWS configuration
const validateAWSConfig = () => {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing AWS configuration: ${missing.join(', ')}. ` +
      'Please set up your .env file with AWS credentials. ' +
      'See AWS_S3_SETUP_GUIDE.md for instructions.'
    );
  }
};

// Initialize S3 Client
let s3Client;
try {
  validateAWSConfig();
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  console.log('✅ AWS S3 Client initialized successfully');
  console.log('📍 Region:', process.env.AWS_REGION || 'us-east-1');
  console.log('🪣 Bucket:', process.env.AWS_S3_BUCKET_NAME);
} catch (error) {
  console.error('❌ AWS S3 Configuration Error:', error.message);
  s3Client = null; // Will be caught in the upload middleware
}

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed.'), false);
  }
};

// Configure multer with S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user ? req.user._id.toString() : 'anonymous',
        uploadedAt: new Date().toISOString()
      });
    },
    key: (req, file, cb) => {
      // Generate unique filename: properties/uuid-timestamp.ext
      const fileExtension = path.extname(file.originalname);
      const fileName = `properties/${uuidv4()}-${Date.now()}${fileExtension}`;
      cb(null, fileName);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (free tier friendly)
    files: 10 // Max 10 files per upload
  }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  console.error('🚨 Upload middleware error:', err.message);
  console.error('Error type:', err.constructor.name);
  console.error('Full error:', err);

  // Check for AWS configuration errors
  if (err.message && err.message.includes('Missing AWS configuration')) {
    return res.status(503).json({
      success: false,
      message: 'AWS S3 is not configured. Please contact administrator.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files per upload.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in upload.'
      });
    }
  }

  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // S3 or other errors
  return res.status(500).json({
    success: false,
    message: 'Error uploading file. Please try again.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Middleware to check AWS configuration before uploads
const checkAWSConfig = (req, res, next) => {
  if (!s3Client) {
    return res.status(503).json({
      success: false,
      message: 'Image upload service is not configured. Please set up AWS S3 credentials.',
      error: process.env.NODE_ENV === 'development'
        ? 'Missing AWS credentials in .env file. See AWS_S3_SETUP_GUIDE.md'
        : undefined
    });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError,
  checkAWSConfig
};