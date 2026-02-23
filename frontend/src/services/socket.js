import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Connect to Socket.IO server
 * @returns {Object} Socket instance
 */
export const connectSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✓ Connected to Socket.IO server');
  });

  socket.on('disconnect', () => {
    console.log('✗ Disconnected from Socket.IO server');
  });

  socket.on('error', (error) => {
    console.error('Socket.IO Error:', error);
  });

  return socket;
};

/**
 * Disconnect from Socket.IO server
 */
export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get socket instance
 * @returns {Object} Socket instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Check if socket is connected
 * @returns {boolean}
 */
export const isSocketConnected = () => {
  return socket?.connected || false;
};

/**
 * Socket event listeners for matching and calls
 */
export const socketEvents = {
  /**
   * Join matching queue
   * @param {string} userId
   */
  joinQueue: (userId) => {
    if (socket?.connected) {
      socket.emit('user-join-queue', { userId });
    }
  },

  /**
   * Leave matching queue
   * @param {string} userId
   */
  leaveQueue: (userId) => {
    if (socket?.connected) {
      socket.emit('leave-queue', { userId });
    }
  },

  /**
   * Send WebRTC offer
   * @param {string} targetUserId
   * @param {Object} offer - RTCSessionDescription
   */
  sendOffer: (targetUserId, offer) => {
    if (socket?.connected) {
      socket.emit('offer', { targetUserId, offer });
    }
  },

  /**
   * Send WebRTC answer
   * @param {string} targetUserId
   * @param {Object} answer - RTCSessionDescription
   */
  sendAnswer: (targetUserId, answer) => {
    if (socket?.connected) {
      socket.emit('answer', { targetUserId, answer });
    }
  },

  /**
   * Send ICE candidate
   * @param {string} targetUserId
   * @param {Object} candidate - RTCIceCandidate
   */
  sendICECandidate: (targetUserId, candidate) => {
    if (socket?.connected) {
      socket.emit('ice-candidate', { targetUserId, candidate });
    }
  },

  /**
   * End call
   * @param {string} userId
   * @param {string} targetUserId
   */
  endCall: (userId, targetUserId) => {
    if (socket?.connected) {
      socket.emit('end-call', { userId, targetUserId });
    }
  },

  /**
   * Listen for match found
   * @param {Function} callback - Called with { matchedUserId, matchedUser, commonInterests }
   */
  onMatchFound: (callback) => {
    if (socket) {
      socket.on('match-found', callback);
    }
  },

  /**
   * Listen for waiting for match
   * @param {Function} callback
   */
  onWaitingForMatch: (callback) => {
    if (socket) {
      socket.on('waiting-for-match', callback);
    }
  },

  /**
   * Listen for offer
   * @param {Function} callback - Called with { offer, senderId }
   */
  onOffer: (callback) => {
    if (socket) {
      socket.on('offer', callback);
    }
  },

  /**
   * Listen for answer
   * @param {Function} callback - Called with { answer, senderId }
   */
  onAnswer: (callback) => {
    if (socket) {
      socket.on('answer', callback);
    }
  },

  /**
   * Listen for ICE candidate
   * @param {Function} callback - Called with { candidate, senderId }
   */
  onICECandidate: (callback) => {
    if (socket) {
      socket.on('ice-candidate', callback);
    }
  },

  /**
   * Listen for call ended
   * @param {Function} callback
   */
  onCallEnded: (callback) => {
    if (socket) {
      socket.on('call-ended', callback);
    }
  },

  /**
   * Listen for socket errors
   * @param {Function} callback
   */
  onError: (callback) => {
    if (socket) {
      socket.on('error', callback);
    }
  },

  /**
   * Remove all listeners
   */
  removeAllListeners: () => {
    if (socket) {
      socket.removeAllListeners();
    }
  },
};

export default { connectSocket, disconnectSocket, getSocket, isSocketConnected, socketEvents };
