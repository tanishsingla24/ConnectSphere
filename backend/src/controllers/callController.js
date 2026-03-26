import Call from '../models/Call.js';

/**
 * Get recent call history for the authenticated user.
 * Returns calls where the user is either participant (userA or userB).
 */
export const getCallHistory = async (req, res, next) => {
  try {
    const userId = req.userId;

    const calls = await Call.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .sort({ startedAt: -1, createdAt: -1 })
      .limit(20)
      .populate('userA', 'fullName email interests')
      .populate('userB', 'fullName email interests');

    res.json({
      success: true,
      calls: calls.map((c) => ({
        id: c._id,
        status: c.status,
        commonInterests: c.commonInterests,
        startedAt: c.startedAt,
        endedAt: c.endedAt,
        endedBy: c.endedBy,
        participants: {
          userA: c.userA,
          userB: c.userB,
        },
      })),
    });
  } catch (error) {
    next(error);
  }
};

