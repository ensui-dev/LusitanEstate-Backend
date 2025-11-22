const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const User = require('../models/User');
const {
  sendInquiryConfirmation,
  sendInquiryNotification,
  sendInquiryResponseEmail
} = require('../services/emailService');
const { isSESConfigured } = require('../config/ses');

// @desc    Get all inquiries for a property
// @route   GET /api/inquiries/property/:propertyId
// @access  Private (property owner, agent, admin)
exports.getPropertyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ property: req.params.propertyId })
      .populate('user', 'name email phone')
      .populate('property', 'title address')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's inquiries
// @route   GET /api/inquiries/my-inquiries
// @access  Private
exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ user: req.user._id })
      .populate('property', 'title address price images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Private
exports.createInquiry = async (req, res) => {
  try {
    // Add user to inquiry
    req.body.user = req.user._id;

    const inquiry = await Inquiry.create(req.body);

    await inquiry.populate('property', 'title address owner');

    // Send email notifications if SES is configured
    if (isSESConfigured()) {
      try {
        // Get the property with owner details
        const property = await Property.findById(inquiry.property._id)
          .populate('owner', 'name email');

        const propertyTitle = property.title;
        const propertyAddress = `${property.address.street}, ${property.address.city}`;

        // Send confirmation email to the user who made the inquiry
        await sendInquiryConfirmation(
          req.user.email,
          req.user.name,
          propertyTitle,
          propertyAddress,
          inquiry.message
        );

        // Send notification to the property owner
        if (property.owner && property.owner.email) {
          await sendInquiryNotification(
            property.owner.email,
            property.owner.name,
            req.user.name,
            req.user.email,
            req.user.phone || 'Não fornecido',
            propertyTitle,
            propertyAddress,
            inquiry.message
          );
        }
      } catch (emailError) {
        console.error('Error sending inquiry emails:', emailError.message);
        // Don't fail the inquiry creation if emails fail
      }
    }

    res.status(201).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update inquiry status and response
// @route   PUT /api/inquiries/:id
// @access  Private (property owner, agent, admin)
exports.updateInquiry = async (req, res) => {
  try {
    let inquiry = await Inquiry.findById(req.params.id)
      .populate('user', 'name email')
      .populate('property', 'title address');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check if we're responding to inquiry
    const isResponding = req.body.response && req.body.status === 'responded';

    // If responding to inquiry, set respondedAt
    if (isResponding) {
      req.body.respondedAt = Date.now();
    }

    const updatedInquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'name email').populate('property', 'title address');

    // Send response email to the user if responding and SES is configured
    if (isResponding && isSESConfigured() && inquiry.user && inquiry.user.email) {
      try {
        const propertyTitle = inquiry.property.title;
        const propertyAddress = `${inquiry.property.address.street}, ${inquiry.property.address.city}`;

        await sendInquiryResponseEmail(
          inquiry.user.email,
          inquiry.user.name,
          propertyTitle,
          propertyAddress,
          req.body.response
        );
      } catch (emailError) {
        console.error('Error sending inquiry response email:', emailError.message);
        // Don't fail the update if email fails
      }
    }

    res.status(200).json({
      success: true,
      data: updatedInquiry
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (inquiry owner, admin)
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check if user is inquiry owner or admin
    if (inquiry.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this inquiry'
      });
    }

    await inquiry.deleteOne();

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

// @desc    Get single inquiry
// @route   GET /api/inquiries/:id
// @access  Private
exports.getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('property', 'title address price images');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
