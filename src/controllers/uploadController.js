const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');

// @desc    Upload property images
// @route   POST /api/upload/property-images
// @access  Private
exports.uploadPropertyImages = async (req, res) => {
  try {
    console.log('📸 Upload request received');
    console.log('Files:', req.files ? req.files.length : 0);

    if (!req.files || req.files.length === 0) {
      console.log('❌ No files in request');
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Format the uploaded files info
    const uploadedImages = req.files.map(file => ({
      url: file.location, // S3 URL
      key: file.key, // S3 key for deletion later
      size: file.size,
      mimetype: file.mimetype,
      originalName: file.originalname
    }));

    console.log('✅ Upload successful:', uploadedImages.length, 'images');

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedImages
    });
  } catch (error) {
    console.error('❌ Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete image from S3
// @route   DELETE /api/upload/delete-image
// @access  Private
exports.deleteImage = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Image key is required'
      });
    }

    // Delete from S3
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload single profile image (for users/agents)
// @route   POST /api/upload/profile-image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const uploadedImage = {
      url: req.file.location,
      key: req.file.key,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: uploadedImage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading profile image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};