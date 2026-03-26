import User from '../models/User.js';
import * as matchingService from '../services/matchingService.js';
import Call from '../models/Call.js';

const canonicalPair = (id1, id2) => {
  const a = String(id1);
  const b = String(id2);
  return a < b ? { userA: a, userB: b } : { userA: b, userB: a };
};

/**
 * Setup Socket.IO event handlers for WebRTC signaling and matching
 * @param {Object} io - Socket.IO instance
 */
export const setupSocketHandlers = (io) => {
  io.on('connection', async (socket) => {
    console.log(`✓ User connected: ${socket.id}`);

    /**
     * Event: user-join-queue
     * Add user to matching queue
     */
    socket.on('user-join-queue', async (data) => {
      try {
        const { userId } = data;

        // Fetch user from database
        const user = await User.findById(userId);
        if (!user) {
          return socket.emit('error', { message: 'User not found' });
        }

        if (user.isBanned) {
          return socket.emit('error', { message: 'User is banned' });
        }

        // Update user in database
        user.isOnline = true;
        user.socketId = socket.id;
        user.inCall = false;
        await user.save();

        // Make signaling reliable: each socket joins a room named after its userId.
        // Then the server can emit offers/answers/ICE to io.to(targetUserId).
        socket.data.userId = userId;
        socket.join(userId);

        // Add to matching queue
        matchingService.addToQueue(userId, user);

        // Find a match for this user
        const match = matchingService.findMatch(userId, user.interests);

        if (match) {
          // Found a match
          console.log(`✓ Match found: ${userId} <-> ${match.matchedUserId}`);

          // Get matched user from database for full details
          const matchedUser = await User.findById(match.matchedUserId);
          const currentUser = await User.findById(userId);

          // Update both users as in-call
          currentUser.inCall = true;
          matchedUser.inCall = true;
          await currentUser.save();
          await matchedUser.save();

          // Remove both from queue
          matchingService.removeFromQueue(userId);
          matchingService.removeFromQueue(match.matchedUserId);

          // Create (or reuse) a call record for history/dashboard.
          // We store participants as an unordered pair so we can find it later
          // regardless of who starts the WebRTC offer.
          const pair = canonicalPair(userId, match.matchedUserId);
          const existingCall = await Call.findOne({
            userA: pair.userA,
            userB: pair.userB,
            endedAt: null,
          });

          if (!existingCall) {
            await Call.create({
              userA: pair.userA,
              userB: pair.userB,
              status: 'matched',
              commonInterests: match.commonInterests,
              startedAt: null,
              endedAt: null,
            });
          } else if (match.commonInterests?.length) {
            existingCall.commonInterests = match.commonInterests;
            await existingCall.save();
          }

          // Emit match event to both users (by their userId rooms).
          io.to(userId).emit('match-found', {
            matchedUserId: match.matchedUserId,
            matchedUser: matchedUser.toJSON(),
            commonInterests: match.commonInterests,
          });

          io.to(match.matchedUserId).emit('match-found', {
            matchedUserId: userId,
            matchedUser: currentUser.toJSON(),
            commonInterests: match.commonInterests,
          });
        } else {
          // No match found
          socket.emit('waiting-for-match', { message: 'Waiting for a match...' });
        }
      } catch (error) {
        console.error('Error in user-join-queue:', error);
        socket.emit('error', { message: 'Failed to join queue' });
      }
    });

    /**
     * Event: leave-queue
     * Remove user from matching queue
     */
    socket.on('leave-queue', async (data) => {
      try {
        const { userId } = data;

        matchingService.removeFromQueue(userId);

        const user = await User.findById(userId);
        if (user) {
          user.isOnline = false;
          user.socketId = null;
          user.inCall = false;
          await user.save();
        }

        socket.emit('left-queue', { message: 'Left queue' });
      } catch (error) {
        console.error('Error in leave-queue:', error);
      }
    });

    /**
     * Event: offer
     * Relay WebRTC offer from one peer to another
     */
    socket.on('offer', (data) => {
      const { targetUserId, offer } = data;
      const callerUserId = socket.data?.userId;

      console.log(`→ Relaying offer from ${socket.id} to ${targetUserId}`);

      // Record call start for history.
      (async () => {
        try {
          if (!callerUserId || !targetUserId) return;
          const pair = canonicalPair(callerUserId, targetUserId);

          const ongoingCall = await Call.findOne({
            userA: pair.userA,
            userB: pair.userB,
            endedAt: null,
          }).sort({ createdAt: -1 });

          const now = new Date();
          if (ongoingCall) {
            ongoingCall.caller = callerUserId;
            ongoingCall.callee = targetUserId;
            ongoingCall.status = 'calling';
            ongoingCall.startedAt = ongoingCall.startedAt || now;
            await ongoingCall.save();
          } else {
            await Call.create({
              userA: pair.userA,
              userB: pair.userB,
              caller: callerUserId,
              callee: targetUserId,
              status: 'calling',
              startedAt: now,
              endedAt: null,
            });
          }
        } catch (err) {
          console.error('Failed to record call start:', err);
        }
      })();

      io.to(targetUserId).emit('offer', { offer, senderId: socket.id });
    });

    /**
     * Event: answer
     * Relay WebRTC answer from one peer to another
     */
    socket.on('answer', (data) => {
      const { targetUserId, answer } = data;
      console.log(`→ Relaying answer from ${socket.id} to ${targetUserId}`);
      io.to(targetUserId).emit('answer', { answer, senderId: socket.id });
    });

    /**
     * Event: ice-candidate
     * Relay ICE candidates between peers
     */
    socket.on('ice-candidate', (data) => {
      const { targetUserId, candidate } = data;
      io.to(targetUserId).emit('ice-candidate', { candidate, senderId: socket.id });
    });

    /**
     * Event: end-call
     * Terminate call between two peers
     */
    socket.on('end-call', async (data) => {
      try {
        const { userId, targetUserId } = data;
        console.log(`✓ Call ended between ${userId} and ${targetUserId}`);

        // Update both users so matching can work again.
        const [endingUser, otherUser] = await Promise.all([
          User.findById(userId),
          User.findById(targetUserId),
        ]);

        if (endingUser) {
          endingUser.inCall = false;
          await endingUser.save();
        }
        if (otherUser) {
          otherUser.inCall = false;
          await otherUser.save();
        }

        // Close call history record.
        const pair = canonicalPair(userId, targetUserId);
        await Call.findOneAndUpdate(
          {
            userA: pair.userA,
            userB: pair.userB,
            endedAt: null,
          },
          {
            $set: {
              endedAt: new Date(),
              endedBy: userId,
              status: 'ended',
            },
          },
          { sort: { createdAt: -1 } }
        );

        // Notify other peer (by userId room)
        io.to(targetUserId).emit('call-ended', { message: 'Other user ended call' });

        // Remove from queue if still there
        matchingService.removeFromQueue(userId);

        socket.emit('call-ended', { message: 'Call ended' });
      } catch (error) {
        console.error('Error in end-call:', error);
      }
    });

    /**
     * Event: disconnect
     * Handle user disconnect
     */
    socket.on('disconnect', async () => {
      try {
        console.log(`✗ User disconnected: ${socket.id}`);

        // Find and update user
        const users = await User.find({ socketId: socket.id });
        for (const user of users) {
          user.isOnline = false;
          user.socketId = null;
          user.inCall = false;
          await user.save();

          matchingService.removeFromQueue(user._id.toString());
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });
};

export default { setupSocketHandlers };
