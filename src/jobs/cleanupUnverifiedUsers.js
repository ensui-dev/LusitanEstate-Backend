const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');

/**
 * Cleanup unverified users older than 24 hours
 * This job runs periodically to remove accounts that were never verified
 */
const cleanupUnverifiedUsers = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find unverified users older than 24 hours
    const usersToDelete = await User.find({
      isEmailVerified: false,
      createdAt: { $lt: twentyFourHoursAgo }
    }).select('_id email');

    if (usersToDelete.length === 0) {
      console.log('[Cleanup Job] No unverified users to clean up');
      return { deleted: 0 };
    }

    const userIds = usersToDelete.map(user => user._id);
    const userEmails = usersToDelete.map(user => user.email);

    console.log(`[Cleanup Job] Found ${usersToDelete.length} unverified users to delete:`, userEmails);

    // Delete related data first (cascade delete)
    const [favoritesResult, inquiriesResult, reviewsResult] = await Promise.all([
      Favorite.deleteMany({ user: { $in: userIds } }),
      Inquiry.deleteMany({ user: { $in: userIds } }),
      Review.deleteMany({ user: { $in: userIds } })
    ]);

    console.log(`[Cleanup Job] Deleted related data - Favorites: ${favoritesResult.deletedCount}, Inquiries: ${inquiriesResult.deletedCount}, Reviews: ${reviewsResult.deletedCount}`);

    // Delete the users
    const usersResult = await User.deleteMany({
      _id: { $in: userIds }
    });

    console.log(`[Cleanup Job] Successfully deleted ${usersResult.deletedCount} unverified users`);

    return {
      deleted: usersResult.deletedCount,
      relatedData: {
        favorites: favoritesResult.deletedCount,
        inquiries: inquiriesResult.deletedCount,
        reviews: reviewsResult.deletedCount
      }
    };
  } catch (error) {
    console.error('[Cleanup Job] Error cleaning up unverified users:', error.message);
    return { error: error.message };
  }
};

/**
 * Start the cleanup job scheduler
 * Runs every hour by default
 */
const startCleanupScheduler = (intervalHours = 1) => {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`[Cleanup Job] Scheduler started - running every ${intervalHours} hour(s)`);

  // Run immediately on startup
  cleanupUnverifiedUsers();

  // Then run at specified interval
  setInterval(cleanupUnverifiedUsers, intervalMs);
};

module.exports = {
  cleanupUnverifiedUsers,
  startCleanupScheduler
};
