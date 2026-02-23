import User from '../models/User.js';
import * as matchingService from '../services/matchingService.js';

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

          // Get matched user's socket ID
          const matchedUserSocketId = matchingService.getUserFromQueue(match.matchedUserId)?.user.socketId;

          // Get the socket of the matched user
          const matchedUserSocket = io.to(matchedUserSocketId || match.matchedUserId);

          // Emit match event to both users
          socket.emit('match-found', {
            matchedUserId: match.matchedUserId,
            matchedUser: { ...matchedUser.toJSON(), socketId: match.matchedUserId },
            commonInterests: match.commonInterests,
          });

          io.to(matchedUserSocketId).emit('match-found', {
            matchedUserId: userId,
            matchedUser: { ...currentUser.toJSON(), socketId: socket.id },
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
      console.log(`→ Relaying offer from ${socket.id} to ${targetUserId}`);

      // Get the socket of target user and send offer
      const targetSocket = Array.from(io.sockets.sockets.values()).find(
        (s) => s.data?.userId === targetUserId
      );

      if (targetSocket) {
        targetSocket.emit('offer', { offer, senderId: socket.id });
      } else {
        // Find by socket ID directly
        io.to(targetUserId).emit('offer', { offer, senderId: socket.id });
      }
    });

    /**
     * Event: answer
     * Relay WebRTC answer from one peer to another
     */
    socket.on('answer', (data) => {
      const { targetUserId, answer } = data;
      console.log(`→ Relaying answer from ${socket.id} to ${targetUserId}`);

      const targetSocket = Array.from(io.sockets.sockets.values()).find(
        (s) => s.data?.userId === targetUserId
      );

      if (targetSocket) {
        targetSocket.emit('answer', { answer, senderId: socket.id });
      } else {
        io.to(targetUserId).emit('answer', { answer, senderId: socket.id });
      }
    });

    /**
     * Event: ice-candidate
     * Relay ICE candidates between peers
     */
    socket.on('ice-candidate', (data) => {
      const { targetUserId, candidate } = data;

      const targetSocket = Array.from(io.sockets.sockets.values()).find(
        (s) => s.data?.userId === targetUserId
      );

      if (targetSocket) {
        targetSocket.emit('ice-candidate', { candidate, senderId: socket.id });
      } else {
        io.to(targetUserId).emit('ice-candidate', { candidate, senderId: socket.id });
      }
    });

    /**
     * Event: end-call
     * Terminate call between two peers
     */
    socket.on('end-call', async (data) => {
      try {
        const { userId, targetUserId } = data;
        console.log(`✓ Call ended between ${userId} and ${targetUserId}`);

        // Update user status
        const user = await User.findById(userId);
        if (user) {
          user.inCall = false;
          await user.save();
        }

        // Notify other peer
        const targetSocket = Array.from(io.sockets.sockets.values()).find(
          (s) => s.data?.userId === targetUserId
        );

        if (targetSocket) {
          targetSocket.emit('call-ended', { message: 'Other user ended call' });
        } else {
          io.to(targetUserId).emit('call-ended', { message: 'Other user ended call' });
        }

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
