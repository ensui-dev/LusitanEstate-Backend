const express = require('express');
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  addSavedSearch,
  removeSavedSearch
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All favorite routes require authentication
router.use(protect);

router.get('/', getFavorites);
router.post('/:propertyId', addToFavorites);
router.delete('/:propertyId', removeFromFavorites);

router.post('/saved-search', addSavedSearch);
router.delete('/saved-search/:searchId', removeSavedSearch);

module.exports = router;
