import { useState, useRef, useCallback, useEffect } from 'react';
import {
  createPeerConnection,
  getUserMedia,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addICECandidate,
  addStreamTracks,
  stopMediaStream,
  closePeerConnection,
} from '../webrtc/RTCPeerConnection.js';
import { socketEvents } from '../services/socket.js';

/**
 * Custom hook for managing WebRTC peer connection
 * @returns {Object} Peer connection state and handlers
 */
export const usePeerConnection = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  /**
   * Initialize local media stream
   */
  const initializeLocalStream = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);

      if (localStreamRef.current) {
        setLocalStream(localStreamRef.current);
        return localStreamRef.current;
      }

      const stream = await getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      setLocalStream(stream);

      return stream;
    } catch (err) {
      const errorMessage = err.name === 'NotAllowedError'
        ? 'Camera/microphone permission denied'
        : err.name === 'NotFoundError'
        ? 'No camera/microphone found'
        : 'Failed to get media: ' + err.message;

      console.error(errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Initialize peer connection
   */
  const initializePeerConnection = useCallback(
    (userId, targetUserId, isCaller = false) => {
      try {
        const pc = createPeerConnection();

        // Add local stream tracks
        if (localStreamRef.current) {
          addStreamTracks(pc, localStreamRef.current);
        }

        // Handle remote stream
        pc.ontrack = (event) => {
          console.log('✓ Received remote track:', event.track.kind);
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
            setRemoteStream(remoteStreamRef.current);
          }
          remoteStreamRef.current.addTrack(event.track);
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socketEvents.sendICECandidate(targetUserId, event.candidate);
          }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          console.log('Connection state:', pc.connectionState);
          if (
            pc.connectionState === 'failed' ||
            pc.connectionState === 'disconnected'
          ) {
            setError('Connection failed');
          }
        };

        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', pc.iceConnectionState);
        };

        peerConnectionRef.current = pc;

        return pc;
      } catch (err) {
        console.error('Failed to initialize peer connection:', err);
        setError('Failed to initialize peer connection');
        throw err;
      }
    },
    []
  );

  /**
   * Start call as initiator (create offer)
   */
  const startCall = useCallback(async (userId, targetUserId) => {
    try {
      setIsConnecting(true);
      setError(null);

      // Ensure local stream exists
      if (!localStreamRef.current) {
        await initializeLocalStream();
      }

      // Create peer connection
      const pc = initializePeerConnection(userId, targetUserId, true);

      // Create and send offer
      const offer = await createOffer(pc);
      socketEvents.sendOffer(targetUserId, offer);

      return pc;
    } catch (err) {
      console.error('Failed to start call:', err);
      setError('Failed to start call');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [initializeLocalStream, initializePeerConnection]);

  /**
   * Answer incoming call
   */
  const answerCall = useCallback(
    async (userId, targetUserId, offer) => {
      try {
        setIsConnecting(true);
        setError(null);

        // Ensure local stream exists
        if (!localStreamRef.current) {
          await initializeLocalStream();
        }

        // Create peer connection
        const pc = initializePeerConnection(userId, targetUserId, false);

        // Set remote offer
        await setRemoteDescription(pc, offer);

        // Create and send answer
        const answer = await createAnswer(pc);
        socketEvents.sendAnswer(targetUserId, answer);

        return pc;
      } catch (err) {
        console.error('Failed to answer call:', err);
        setError('Failed to answer call');
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [initializeLocalStream, initializePeerConnection]
  );

  /**
   * Handle received answer
   */
  const handleRemoteAnswer = useCallback(async (answer) => {
    try {
      if (!peerConnectionRef.current) {
        console.warn('No peer connection for remote answer');
        return;
      }

      await setRemoteDescription(peerConnectionRef.current, answer);
      console.log('Remote answer set');
    } catch (err) {
      console.error('Failed to handle remote answer:', err);
      setError('Failed to handle remote answer');
    }
  }, []);

  /**
   * Handle received ICE candidate
   */
  const handleRemoteICECandidate = useCallback(async (candidate) => {
    try {
      if (!peerConnectionRef.current) {
        console.warn('No peer connection for ICE candidate');
        return;
      }

      await addICECandidate(peerConnectionRef.current, candidate);
    } catch (err) {
      console.error('Failed to add remote ICE candidate:', err);
      // Don't set error - ICE gathering can fail gracefully
    }
  }, []);

  /**
   * Toggle audio track
   */
  const toggleAudio = useCallback((enabled) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }, []);

  /**
   * Toggle video track
   */
  const toggleVideo = useCallback((enabled) => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }, []);

  /**
   * End call and cleanup
   */
  const endCall = useCallback(() => {
    if (peerConnectionRef.current) {
      closePeerConnection(peerConnectionRef.current);
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      stopMediaStream(localStreamRef.current);
      localStreamRef.current = null;
      setLocalStream(null);
    }

    if (remoteStreamRef.current) {
      stopMediaStream(remoteStreamRef.current);
      remoteStreamRef.current = null;
      setRemoteStream(null);
    }

    setError(null);
    console.log('✓ Call ended and cleaned up');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    // State
    localStream,
    remoteStream,
    isConnecting,
    error,

    // Methods
    initializeLocalStream,
    initializePeerConnection,
    startCall,
    answerCall,
    handleRemoteAnswer,
    handleRemoteICECandidate,
    toggleAudio,
    toggleVideo,
    endCall,

    // Refs
    peerConnectionRef,
    localStreamRef,
    remoteStreamRef,
  };
};

export default usePeerConnection;
