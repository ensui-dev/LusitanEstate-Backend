const Agent = require('../models/Agent');
const User = require('../models/User');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Public
exports.getAgents = async (req, res) => {
  try {
    const agents = await Agent.find()
      .populate('user', 'name email phone profilePicture')
      .populate('propertiesListed')
      .sort('-averageRating');

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Public
exports.getAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)
      .populate('user', 'name email phone profilePicture')
      .populate('propertiesListed');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create agent profile
// @route   POST /api/agents
// @access  Private (user must have agent role)
exports.createAgent = async (req, res) => {
  try {
    // Check if user has agent role
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only users with agent role can create agent profile'
      });
    }

    // Check if agent profile already exists for this user
    const existingAgent = await Agent.findOne({ user: req.user._id });

    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'Agent profile already exists for this user'
      });
    }

    // Add user to agent data
    req.body.user = req.user._id;

    const agent = await Agent.create(req.body);

    res.status(201).json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update agent profile
// @route   PUT /api/agents/:id
// @access  Private (agent owner or admin)
exports.updateAgent = async (req, res) => {
  try {
    let agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Check if user is agent owner or admin
    if (agent.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this agent profile'
      });
    }

    agent = await Agent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete agent profile
// @route   DELETE /api/agents/:id
// @access  Private (agent owner or admin)
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Check if user is agent owner or admin
    if (agent.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this agent profile'
      });
    }

    await agent.deleteOne();

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

// @desc    Get my agent profile
// @route   GET /api/agents/me
// @access  Private (agent)
exports.getMyAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findOne({ user: req.user._id })
      .populate('user', 'name email phone profilePicture')
      .populate('propertiesListed');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
