const Property = require('../models/Property');

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const {
      propertyType,
      status,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      city,
      state,
      features
    } = req.query;

    let query = {};

    // Build filter query
    if (propertyType) query.propertyType = propertyType;
    if (status) query.status = status;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: parseInt(bathrooms) };
    if (features) query.features = { $in: features.split(',') };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // Only show approved properties in public listing
    query.approvalStatus = 'approved';

    const properties = await Property.find(query)
      .populate('owner', 'name email phone')
      .populate('agent')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public (but restricted for non-approved properties)
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('agent');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // If property is not approved, only owner and admin can view it
    if (property.approvalStatus !== 'approved') {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Check if user is owner or admin
      const isOwner = property.owner._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (seller, agent, admin)
exports.createProperty = async (req, res) => {
  try {
    // Validate that at least one image is provided
    if (!req.body.images || req.body.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one property image is required'
      });
    }

    // Validate that all images have URLs
    const validImages = req.body.images.filter(img => img.url && img.url.trim() !== '');
    if (validImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid property image is required'
      });
    }

    // Add user as owner
    req.body.owner = req.user._id;

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (owner, admin)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user is property owner or admin
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (owner, admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user is property owner or admin
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's properties
// @route   GET /api/properties/user/my-properties
// @access  Private
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .populate('agent')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};