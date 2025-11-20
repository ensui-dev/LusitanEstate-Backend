const Favorite = require('../models/Favorite');

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    let favorite = await Favorite.findOne({ user: req.user._id })
      .populate('properties');

    if (!favorite) {
      favorite = await Favorite.create({ user: req.user._id, properties: [] });
    }

    res.status(200).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add property to favorites
// @route   POST /api/favorites/:propertyId
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;

    let favorite = await Favorite.findOne({ user: req.user._id });

    if (!favorite) {
      favorite = await Favorite.create({
        user: req.user._id,
        properties: [propertyId]
      });
    } else {
      // Check if property already in favorites
      if (favorite.properties.includes(propertyId)) {
        return res.status(400).json({
          success: false,
          message: 'Property already in favorites'
        });
      }

      favorite.properties.push(propertyId);
      await favorite.save();
    }

    await favorite.populate('properties');

    res.status(200).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove property from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const favorite = await Favorite.findOne({ user: req.user._id });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorites not found'
      });
    }

    favorite.properties = favorite.properties.filter(
      prop => prop.toString() !== propertyId
    );

    await favorite.save();
    await favorite.populate('properties');

    res.status(200).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add saved search
// @route   POST /api/favorites/saved-search
// @access  Private
exports.addSavedSearch = async (req, res) => {
  try {
    let favorite = await Favorite.findOne({ user: req.user._id });

    if (!favorite) {
      favorite = await Favorite.create({
        user: req.user._id,
        savedSearches: [req.body]
      });
    } else {
      favorite.savedSearches.push(req.body);
      await favorite.save();
    }

    res.status(200).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove saved search
// @route   DELETE /api/favorites/saved-search/:searchId
// @access  Private
exports.removeSavedSearch = async (req, res) => {
  try {
    const { searchId } = req.params;

    const favorite = await Favorite.findOne({ user: req.user._id });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorites not found'
      });
    }

    favorite.savedSearches = favorite.savedSearches.filter(
      search => search._id.toString() !== searchId
    );

    await favorite.save();

    res.status(200).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
