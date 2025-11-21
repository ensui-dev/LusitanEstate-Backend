const express = require('express');
const {
  uploadPropertyImages,
  uploadProfileImage,
  deleteImage
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { upload, handleUploadError, checkAWSConfig } = require('../middleware/upload');

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// Check AWS configuration before allowing uploads
router.use(checkAWSConfig);

// Upload multiple property images
router.post(
  '/property-images',
  upload.array('images', 10), // Max 10 images
  handleUploadError,
  uploadPropertyImages
);

// Upload single profile image
router.post(
  '/profile-image',
  upload.single('image'),
  handleUploadError,
  uploadProfileImage
);

// Delete image from S3
router.delete('/delete-image', deleteImage);

module.exports = router;