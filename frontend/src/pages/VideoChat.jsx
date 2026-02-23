import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectSocket, getSocket, socketEvents } from '../services/socket';
import usePeerConnection from '../hooks/usePeerConnection';
import VideoStream from '../components/VideoStream';
import CallButton from '../components/CallButton';
import '../styles/VideoChat.css';

export default function VideoChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('idle'); // idle, searching, calling, connected
  const [matchedUser, setMatchedUser] = useState(null);
  const [commonInterests, setCommonInterests] = useState([]);
  const [error, setError] = useState('');
  const {
    localStream,
    remoteStream,
    isConnecting,
    startCall,
    answerCall,
    handleRemoteAnswer,
    handleRemoteICECandidate,
    toggleAudio,
    toggleVideo,
    endCall,
  } = usePeerConnection();

  const audioEnabledRef = useRef(true);
  const videoEnabledRef = useRef(true);

  // Initialize socket connection on mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const socket = connectSocket();

    // Setup socket event listeners
    socketEvents.onMatchFound((data) => {
      console.log('✓ Match found:', data);
      setMatchedUser(data.matchedUser);
      setCommonInterests(data.commonInterests);
      setStatus('matched');
      setError('');
    });

    socketEvents.onWaitingForMatch(() => {
      setStatus('searching');
      setError('');
    });

    socketEvents.onOffer(async (data) => {
      console.log('✓ Received offer from', data.senderId);
      try {
        setStatus('calling');
        await answerCall(user._id, matchedUser._id, data.offer);
      } catch (err) {
        setError('Failed to answer call');
      }
    });

    socketEvents.onAnswer(async (data) => {
      console.log('✓ Received answer from', data.senderId);
      try {
        await handleRemoteAnswer(data.answer);
        setStatus('connected');
      } catch (err) {
        setError('Failed to handle answer');
      }
    });

    socketEvents.onICECandidate(async (data) => {
      try {
        await handleRemoteICECandidate(data.candidate);
      } catch (err) {
        console.error('Failed to add ICE candidate');
      }
    });

    socketEvents.onCallEnded(() => {
      handleCallEnd('Other user ended the call');
    });

    socketEvents.onError((error) => {
      setError(error.message || 'Socket error occurred');
    });

    return () => {
      socketEvents.removeAllListeners();
    };
  }, [user, navigate, matchedUser, answerCall, handleRemoteAnswer, handleRemoteICECandidate]);

  const handleStartSearch = async () => {
    try {
      setError('');
      setStatus('searching');
      await initializeLocalStream();
      const socket = getSocket();
      socketEvents.joinQueue(user._id);
    } catch (err) {
      setError('Failed to start search: ' + err.message);
      setStatus('idle');
    }
  };

  const handleInitiateCall = async () => {
    try {
      setError('');
      setStatus('calling');
      await startCall(user._id, matchedUser._id);
    } catch (err) {
      setError('Failed to initiate call: ' + err.message);
      setStatus('matched');
    }
  };

  const handleCallEnd = (reason = 'Call ended') => {
    socketEvents.endCall(user._id, matchedUser?._id);
    endCall();
    setStatus('idle');
    setMatchedUser(null);
    setCommonInterests([]);
    handleReset();
  };

  const handleReset = () => {
    setStatus('idle');
    setMatchedUser(null);
    setCommonInterests([]);
    socketEvents.leaveQueue(user._id);
  };

  const handleToggleAudio = () => {
    audioEnabledRef.current = !audioEnabledRef.current;
    toggleAudio(audioEnabledRef.current);
  };

  const handleToggleVideo = () => {
    videoEnabledRef.current = !videoEnabledRef.current;
    toggleVideo(videoEnabledRef.current);
  };

  const initializeLocalStream = async () => {
    // This will be called by usePeerConnection when needed
  };

  return (
    <div className="video-chat-container">
      <div className="header">
        <h1>Video Chat</h1>
        <div className="user-info">
          <span>{user?.fullName}</span>
          <button className="logout-btn" onClick={() => navigate('/login')}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="video-grid">
        <div className="video-wrapper">
          <h3>You</h3>
          <VideoStream stream={localStream} />
          <div className="stream-controls">
            <button
              onClick={handleToggleAudio}
              className={`control-btn ${audioEnabledRef.current ? 'active' : ''}`}
              title="Toggle Audio"
            >
              🎤
            </button>
            <button
              onClick={handleToggleVideo}
              className={`control-btn ${videoEnabledRef.current ? 'active' : ''}`}
              title="Toggle Video"
            >
              📹
            </button>
          </div>
        </div>

        {remoteStream && (
          <div className="video-wrapper">
            <h3>{matchedUser?.fullName}</h3>
            <VideoStream stream={remoteStream} />
          </div>
        )}
      </div>

      <div className="status-section">
        <p className="status">
          Status:{' '}
          <span className={`status-${status}`}>
            {status === 'idle' && 'Ready'}
            {status === 'searching' && 'Searching for match...'}
            {status === 'matched' && 'Match found!'}
            {status === 'calling' && 'Connecting...'}
            {status === 'connected' && 'Connected'}
          </span>
        </p>

        {matchedUser && (
          <div className="match-info">
            <p>
              <strong>Matched with:</strong> {matchedUser.fullName}
            </p>
            <p>
              <strong>Common interests:</strong> {commonInterests.join(', ')}
            </p>
          </div>
        )}
      </div>

      <div className="action-buttons">
        {status === 'idle' && (
          <button
            onClick={handleStartSearch}
            className="primary-btn"
            disabled={isConnecting}
          >
            {isConnecting ? 'Initializing...' : 'Start Searching'}
          </button>
        )}

        {status === 'searching' && (
          <>
            <p className="searching-text">Looking for a match...</p>
            <button onClick={handleReset} className="secondary-btn">
              Cancel
            </button>
          </>
        )}

        {status === 'matched' && (
          <>
            <button
              onClick={handleInitiateCall}
              className="primary-btn"
              disabled={isConnecting}
            >
              {isConnecting ? 'Initializing Call...' : 'Start Call'}
            </button>
            <button onClick={handleReset} className="secondary-btn">
              Decline & Find Other
            </button>
          </>
        )}

        {(status === 'calling' || status === 'connected') && (
          <button onClick={() => handleCallEnd()} className="danger-btn">
            End Call
          </button>
        )}
      </div>
    </div>
  );
}
