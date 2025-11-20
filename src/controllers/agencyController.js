const Agency = require('../models/Agency');
const Agent = require('../models/Agent');
const Property = require('../models/Property');

/**
 * @desc    Get all agencies
 * @route   GET /api/agencies
 * @access  Public
 */
exports.getAgencies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true };

    if (req.query.district) {
      filter['address.district'] = req.query.district;
    }

    if (req.query.verified === 'true') {
      filter.isVerified = true;
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const agencies = await Agency.find(filter)
      .populate('manager', 'name email phone')
      .populate({
        path: 'agents',
        select: 'user licenseNumber specialization averageRating',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ isVerified: -1, 'ratings.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Agency.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: agencies.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: agencies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single agency
 * @route   GET /api/agencies/:id
 * @access  Public
 */
exports.getAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id)
      .populate('manager', 'name email phone profilePicture')
      .populate({
        path: 'agents',
        select: 'user licenseNumber specialization averageRating totalReviews yearsOfExperience bio',
        populate: { path: 'user', select: 'name email phone profilePicture' }
      });

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Get agency properties
    const properties = await Property.find({ agency: agency._id, approvalStatus: 'approved' })
      .select('title price propertyType status address images')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        agency,
        recentProperties: properties
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new agency
 * @route   POST /api/agencies
 * @access  Private/Admin
 */
exports.createAgency = async (req, res, next) => {
  try {
    // Check if agency name already exists
    const existingAgency = await Agency.findOne({ name: req.body.name });
    if (existingAgency) {
      return res.status(400).json({
        success: false,
        message: 'Agency with this name already exists'
      });
    }

    // Check if license number already exists
    const existingLicense = await Agency.findOne({ licenseNumber: req.body.licenseNumber });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'Agency with this AMI license number already exists'
      });
    }

    const agency = await Agency.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Agency created successfully',
      data: agency
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update agency
 * @route   PUT /api/agencies/:id
 * @access  Private (Agency Manager or Admin)
 */
exports.updateAgency = async (req, res, next) => {
  try {
    let agency = await Agency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Check authorization - only manager or admin can update
    if (agency.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this agency'
      });
    }

    // Don't allow updating verification status unless admin
    if (req.body.isVerified !== undefined && req.user.role !== 'admin') {
      delete req.body.isVerified;
      delete req.body.verifiedAt;
    }

    agency = await Agency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Agency updated successfully',
      data: agency
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete agency
 * @route   DELETE /api/agencies/:id
 * @access  Private/Admin
 */
exports.deleteAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Check if agency has active agents
    const agentCount = await Agent.countDocuments({ agency: agency._id, isActive: true });
    if (agentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete agency with active agents. Please reassign or deactivate agents first.'
      });
    }

    await agency.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Agency deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify agency (Admin only)
 * @route   PUT /api/agencies/:id/verify
 * @access  Private/Admin
 */
exports.verifyAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verifiedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Agency verified successfully',
      data: agency
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unverify agency (Admin only)
 * @route   PUT /api/agencies/:id/unverify
 * @access  Private/Admin
 */
exports.unverifyAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: false,
        verifiedAt: null
      },
      { new: true, runValidators: true }
    );

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Agency verification removed',
      data: agency
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get agency statistics
 * @route   GET /api/agencies/:id/stats
 * @access  Private (Agency Manager or Admin)
 */
exports.getAgencyStats = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Check authorization
    if (agency.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this agency statistics'
      });
    }

    // Get statistics
    const [
      totalAgents,
      activeAgents,
      totalProperties,
      activeProperties,
      soldProperties,
      rentedProperties,
      pendingApproval,
      totalInquiries
    ] = await Promise.all([
      Agent.countDocuments({ agency: agency._id }),
      Agent.countDocuments({ agency: agency._id, isActive: true }),
      Property.countDocuments({ agency: agency._id }),
      Property.countDocuments({ agency: agency._id, status: { $in: ['for-sale', 'for-rent'] } }),
      Property.countDocuments({ agency: agency._id, status: 'sold' }),
      Property.countDocuments({ agency: agency._id, status: 'rented' }),
      Property.countDocuments({ agency: agency._id, approvalStatus: 'pending' }),
      Property.aggregate([
        { $match: { agency: agency._id } },
        { $group: { _id: null, totalInquiries: { $sum: '$inquiries' } } }
      ])
    ]);

    // Properties by district
    const propertiesByDistrict = await Property.aggregate([
      { $match: { agency: agency._id } },
      { $group: { _id: '$address.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Properties by type
    const propertiesByType = await Property.aggregate([
      { $match: { agency: agency._id } },
      { $group: { _id: '$propertyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Average property price
    const avgPrice = await Property.aggregate([
      { $match: { agency: agency._id, status: { $in: ['for-sale', 'for-rent'] } } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalAgents,
          activeAgents,
          totalProperties,
          activeProperties,
          soldProperties,
          rentedProperties,
          pendingApproval,
          totalInquiries: totalInquiries[0]?.totalInquiries || 0
        },
        distributions: {
          propertiesByDistrict,
          propertiesByType
        },
        performance: {
          averagePrice: avgPrice[0]?.avgPrice || 0,
          agencyRating: agency.ratings.average,
          totalReviews: agency.ratings.total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add agent to agency
 * @route   POST /api/agencies/:id/agents
 * @access  Private (Agency Manager or Admin)
 */
exports.addAgentToAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Check authorization
    if (agency.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add agents to this agency'
      });
    }

    const { agentId } = req.body;

    // Check if agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Check subscription limits
    if (agency.subscription.maxAgents !== -1 && agency.agents.length >= agency.subscription.maxAgents) {
      return res.status(400).json({
        success: false,
        message: `Agency has reached maximum agent limit (${agency.subscription.maxAgents}). Please upgrade subscription.`
      });
    }

    // Add agent to agency
    if (!agency.agents.includes(agentId)) {
      agency.agents.push(agentId);
      await agency.save();

      // Update agent's agency reference
      agent.agency = agency._id;
      agent.agencyName = agency.name;
      await agent.save();
    }

    res.status(200).json({
      success: true,
      message: 'Agent added to agency successfully',
      data: agency
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove agent from agency
 * @route   DELETE /api/agencies/:id/agents/:agentId
 * @access  Private (Agency Manager or Admin)
 */
exports.removeAgentFromAgency = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }

    // Check authorization
    if (agency.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove agents from this agency'
      });
    }

    const agentIndex = agency.agents.indexOf(req.params.agentId);
    if (agentIndex > -1) {
      agency.agents.splice(agentIndex, 1);
      await agency.save();
    }

    res.status(200).json({
      success: true,
      message: 'Agent removed from agency successfully',
      data: agency
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
