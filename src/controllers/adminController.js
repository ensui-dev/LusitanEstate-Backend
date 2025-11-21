const User = require('../models/User');
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const Agency = require('../models/Agency');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const Settings = require('../models/Settings');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get current date and calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count statistics
    const [
      totalUsers,
      totalProperties,
      totalAgents,
      totalAgencies,
      totalInquiries,
      totalReviews,
      activeProperties,
      pendingApproval,
      newUsersThisMonth,
      newPropertiesThisWeek,
      pendingInquiries
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Agent.countDocuments(),
      Agency.countDocuments(),
      Inquiry.countDocuments(),
      Review.countDocuments(),
      Property.countDocuments({ status: { $in: ['for-sale', 'for-rent'] }, approvalStatus: 'approved' }),
      Property.countDocuments({ approvalStatus: 'pending' }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Property.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Inquiry.countDocuments({ status: 'pending' })
    ]);

    // User distribution by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Properties by status
    const propertiesByStatus = await Property.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Properties by district (top 10)
    const propertiesByDistrict = await Property.aggregate([
      {
        $group: {
          _id: '$address.district',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Properties by type
    const propertiesByType = await Property.aggregate([
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average property price by district
    const avgPriceByDistrict = await Property.aggregate([
      {
        $match: { status: { $in: ['for-sale', 'for-rent'] } }
      },
      {
        $group: {
          _id: '$address.district',
          avgPrice: { $avg: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgPrice: -1 } },
      { $limit: 10 }
    ]);

    // Recent activities (last 10)
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title price status createdAt address.city address.district')
      .populate('owner', 'name email');

    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email message type status createdAt')
      .populate('property', 'title');

    // Agency statistics
    const agencyStats = await Agency.aggregate([
      {
        $group: {
          _id: null,
          totalActive: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalVerified: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
          },
          avgRating: { $avg: '$ratings.average' }
        }
      }
    ]);

    // Agent statistics
    const agentStats = await Agent.aggregate([
      {
        $group: {
          _id: null,
          totalActive: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalVerified: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
          },
          avgRating: { $avg: '$averageRating' }
        }
      }
    ]);

    // Revenue calculations (if using subscriptions)
    const agencyRevenue = await Agency.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProperties,
          totalAgents,
          totalAgencies,
          totalInquiries,
          totalReviews,
          activeProperties,
          pendingApproval,
          pendingInquiries
        },
        recentActivity: {
          newUsersThisMonth,
          newPropertiesThisWeek
        },
        distributions: {
          usersByRole,
          propertiesByStatus,
          propertiesByDistrict,
          propertiesByType,
          avgPriceByDistrict,
          agencyRevenue
        },
        performance: {
          agency: agencyStats[0] || { totalActive: 0, totalVerified: 0, avgRating: 0 },
          agent: agentStats[0] || { totalActive: 0, totalVerified: 0, avgRating: 0 }
        },
        recent: {
          properties: recentProperties,
          inquiries: recentInquiries
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with filtering and pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['buyer', 'seller', 'agent', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all properties with admin filters
 * @route   GET /api/admin/properties
 * @access  Private/Admin
 */
exports.getAllProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.approvalStatus) {
      filter.approvalStatus = req.query.approvalStatus;
    }
    if (req.query.district) {
      filter['address.district'] = req.query.district;
    }
    if (req.query.propertyType) {
      filter.propertyType = req.query.propertyType;
    }

    const properties = await Property.find(filter)
      .populate('owner', 'name email')
      .populate('agent', 'user licenseNumber')
      .populate('agency', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Property.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: properties
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve property
 * @route   PUT /api/admin/properties/:id/approve
 * @access  Private/Admin
 */
exports.approveProperty = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'approved',
        approvedBy: req.user._id,
        approvedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property approved successfully',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject property
 * @route   PUT /api/admin/properties/:id/reject
 * @access  Private/Admin
 */
exports.rejectProperty = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rejection reason'
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: 'rejected',
        rejectionReason: reason,
        approvedBy: req.user._id,
        approvedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property rejected',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk approve properties
 * @route   PUT /api/admin/properties/bulk-approve
 * @access  Private/Admin
 */
exports.bulkApproveProperties = async (req, res, next) => {
  try {
    const { propertyIds } = req.body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of property IDs'
      });
    }

    const result = await Property.updateMany(
      { _id: { $in: propertyIds } },
      {
        approvalStatus: 'approved',
        approvedBy: req.user._id,
        approvedAt: Date.now()
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} properties approved successfully`,
      data: {
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete property
 * @route   DELETE /api/admin/properties/:id
 * @access  Private/Admin
 */
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update system settings
 * @route   PUT /api/admin/settings
 * @access  Private/Admin
 */
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findOneAndUpdate(
        {},
        { ...req.body, lastUpdatedBy: req.user._id },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all inquiries with filtering and pagination
 * @route   GET /api/admin/inquiries
 * @access  Private/Admin
 */
exports.getAllInquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.inquiryType) {
      filter.inquiryType = req.query.inquiryType;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const inquiries = await Inquiry.find(filter)
      .populate('property', 'title address price images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inquiry.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: inquiries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single inquiry
 * @route   GET /api/admin/inquiries/:id
 * @access  Private/Admin
 */
exports.getInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('property', 'title address price images owner')
      .populate('user', 'name email phone');

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
    next(error);
  }
};

/**
 * @desc    Respond to inquiry
 * @route   PUT /api/admin/inquiries/:id/respond
 * @access  Private/Admin
 */
exports.respondToInquiry = async (req, res, next) => {
  try {
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response'
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        response,
        status: 'responded',
        respondedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('property', 'title').populate('user', 'name email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      data: inquiry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close inquiry
 * @route   PUT /api/admin/inquiries/:id/close
 * @access  Private/Admin
 */
exports.closeInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry closed',
      data: inquiry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete inquiry
 * @route   DELETE /api/admin/inquiries/:id
 * @access  Private/Admin
 */
exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    await inquiry.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;