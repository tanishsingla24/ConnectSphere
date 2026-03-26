/**
 * WebRTC Configuration
 * STUN and TURN servers for NAT traversal
 */
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

/**
 * Create RTCPeerConnection instance
 * @returns {RTCPeerConnection}
 */
export const createPeerConnection = () => {
  return new RTCPeerConnection(rtcConfiguration);
};

/**
 * Get user media (audio and video)
 * @param {Object} constraints - { audio: boolean, video: boolean }
 * @returns {Promise<MediaStream>}
 */
export const getUserMedia = async (constraints = { audio: true, video: true }) => {
  if (!navigator.mediaDevices?.getUserMedia) {
    const hint =
      typeof window !== 'undefined' && !window.isSecureContext
        ? ' Open the app with https:// (e.g. https://YOUR_IP:5173), not http://.'
        : '';
    throw new Error(`Camera/microphone are not available on this page.${hint}`);
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('✓ User media obtained:', stream.getTracks().map((t) => t.kind));
    return stream;
  } catch (error) {
    console.error('✗ Failed to get user media:', error);
    throw error;
  }
};

/**
 * Create WebRTC offer
 * @param {RTCPeerConnection} peerConnection
 * @returns {Promise<RTCSessionDescription>}
 */
export const createOffer = async (peerConnection) => {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('✓ Offer created');
    return offer;
  } catch (error) {
    console.error('✗ Failed to create offer:', error);
    throw error;
  }
};

/**
 * Create WebRTC answer
 * @param {RTCPeerConnection} peerConnection
 * @returns {Promise<RTCSessionDescription>}
 */
export const createAnswer = async (peerConnection) => {
  try {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log('✓ Answer created');
    return answer;
  } catch (error) {
    console.error('✗ Failed to create answer:', error);
    throw error;
  }
};

/**
 * Set remote description (offer or answer)
 * @param {RTCPeerConnection} peerConnection
 * @param {RTCSessionDescription} description
 */
export const setRemoteDescription = async (peerConnection, description) => {
  try {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(description)
    );
    console.log('✓ Remote description set');
  } catch (error) {
    console.error('✗ Failed to set remote description:', error);
    throw error;
  }
};

/**
 * Add ICE candidate
 * @param {RTCPeerConnection} peerConnection
 * @param {RTCIceCandidate} candidate
 */
export const addICECandidate = async (peerConnection, candidate) => {
  try {
    if (candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✓ ICE candidate added');
    }
  } catch (error) {
    console.error('✗ Failed to add ICE candidate:', error);
    // Don't throw - ICE gathering errors are non-fatal
  }
};

/**
 * Add local stream tracks to peer connection
 * @param {RTCPeerConnection} peerConnection
 * @param {MediaStream} stream
 */
export const addStreamTracks = (peerConnection, stream) => {
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
    console.log(`✓ Added ${track.kind} track`);
  });
};

/**
 * Stop media tracks
 * @param {MediaStream} stream
 */
export const stopMediaStream = (stream) => {
  stream.getTracks().forEach((track) => {
    track.stop();
    console.log(`✓ Stopped ${track.kind} track`);
  });
};

/**
 * Close peer connection
 * @param {RTCPeerConnection} peerConnection
 */
export const closePeerConnection = (peerConnection) => {
  if (peerConnection) {
    peerConnection.close();
    console.log('✓ Peer connection closed');
  }
};

/**
 * Get RTCPeerConnection stats
 * @param {RTCPeerConnection} peerConnection
 * @returns {Promise<Object>} Connection stats
 */
export const getConnectionStats = async (peerConnection) => {
  if (!peerConnection) return null;

  try {
    const stats = await peerConnection.getStats();
    const connectionStats = {};

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp') {
        connectionStats.inbound = {
          bytesReceived: report.bytesReceived,
          packetsLost: report.packetsLost,
          fractionLost: report.jitter,
        };
      }
      if (report.type === 'outbound-rtp') {
        connectionStats.outbound = {
          bytesSent: report.bytesSent,
          qualityLimitation: report.qualityLimitation,
        };
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        connectionStats.pair = {
          rtt: report.currentRoundTripTime,
          availableOutgoingBitrate: report.availableOutgoingBitrate,
        };
      }
    });

    return connectionStats;
  } catch (error) {
    console.error('✗ Failed to get stats:', error);
    return null;
  }
};

export default {
  rtcConfiguration,
  createPeerConnection,
  getUserMedia,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addICECandidate,
  addStreamTracks,
  stopMediaStream,
  closePeerConnection,
  getConnectionStats,
};
