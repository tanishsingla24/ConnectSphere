import User from '../models/User.js';

/**
 * User matching queue - stores users waiting for a match
 * Structure: { userId: { user: User, interests: [string] } }
 */
const matchingQueue = new Map();

/**
 * Get common interests between two users
 * @param {Array<string>} interests1
 * @param {Array<string>} interests2
 * @returns {Array<string>} Common interests
 */
const getCommonInterests = (interests1, interests2) => {
  return interests1.filter((interest) => interests2.includes(interest));
};

/**
 * Add user to matching queue
 * @param {string} userId
 * @param {Object} user - User document
 * @returns {void}
 */
export const addToQueue = (userId, user) => {
  matchingQueue.set(userId, {
    user,
    interests: user.interests,
    timestamp: Date.now(),
  });
  console.log(`✓ User ${userId} added to matching queue. Queue size: ${matchingQueue.size}`);
};

/**
 * Remove user from matching queue
 * @param {string} userId
 * @returns {void}
 */
export const removeFromQueue = (userId) => {
  matchingQueue.delete(userId);
  console.log(`✓ User ${userId} removed from matching queue. Queue size: ${matchingQueue.size}`);
};

/**
 * Find a match for a user
 * Finds another user in queue with at least one common interest
 * Prioritizes users with most common interests
 * @param {string} userId
 * @param {Array<string>} userInterests
 * @returns {Object|null} { matchedUserId, commonInterests } or null
 */
export const findMatch = (userId, userInterests) => {
  let bestMatch = null;
  let maxCommonInterests = 0;

  for (const [queuedUserId, queuedUserData] of matchingQueue) {
    // Skip self
    if (queuedUserId === userId) continue;

    // Skip user already in call
    if (queuedUserData.user.inCall) continue;

    // Calculate common interests
    const commonInterests = getCommonInterests(userInterests, queuedUserData.interests);

    if (commonInterests.length > 0 && commonInterests.length > maxCommonInterests) {
      maxCommonInterests = commonInterests.length;
      bestMatch = {
        matchedUserId: queuedUserId,
        commonInterests,
      };
    }
  }

  return bestMatch;
};

/**
 * Get all users in queue (for debugging)
 * @returns {Array<Object>}
 */
export const getQueueStatus = () => {
  return Array.from(matchingQueue.entries()).map(([userId, data]) => ({
    userId,
    fullName: data.user.fullName,
    interests: data.interests,
    timestamp: data.timestamp,
  }));
};

/**
 * Get user from queue
 * @param {string} userId
 * @returns {Object|null}
 */
export const getUserFromQueue = (userId) => {
  return matchingQueue.get(userId) || null;
};

/**
 * Clear matching queue (useful for server restart)
 * @returns {void}
 */
export const clearQueue = () => {
  matchingQueue.clear();
  console.log('✓ Matching queue cleared');
};

/**
 * Get queue size
 * @returns {number}
 */
export const getQueueSize = () => {
  return matchingQueue.size;
};

/**
 * Update user in queue (e.g., update socket ID)
 * @param {string} userId
 * @param {Object} updates - Fields to update
 * @returns {void}
 */
export const updateUserInQueue = (userId, updates) => {
  const userData = matchingQueue.get(userId);
  if (userData) {
    Object.assign(userData.user, updates);
    console.log(`✓ User ${userId} updated in queue`);
  }
};

export default {
  addToQueue,
  removeFromQueue,
  findMatch,
  getQueueStatus,
  getUserFromQueue,
  clearQueue,
  getQueueSize,
  updateUserInQueue,
};
