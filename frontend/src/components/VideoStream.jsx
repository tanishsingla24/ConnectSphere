import React, { useEffect, useRef } from 'react';

/**
 * VideoStream Component
 * Renders a video element for a MediaStream
 * @param {Object} props
 * @param {MediaStream} props.stream - MediaStream to display
 * @param {boolean} props.muted - Whether to mute audio
 */
export default function VideoStream({ stream, muted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !stream) return;

    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className="video-element"
    />
  );
}
