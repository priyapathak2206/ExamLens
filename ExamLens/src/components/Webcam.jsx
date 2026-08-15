import { useEffect, useRef, useState, useCallback } from 'react';
import './Webcam.css';

/**
 * Webcam Component
 * Foundation component that initializes browser media stream (video only)
 * and overlays a synchronized HTML5 canvas element for future AI proctoring annotations.
 */
export default function Webcam() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  // Synchronize internal canvas resolution with natural video stream dimensions
  const syncCanvasDimensions = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      if (video.videoWidth && video.videoHeight) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }
    }
  }, []);

  useEffect(() => {
    let stream = null;

    async function startCamera() {
      setError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('MediaDevices getUserMedia API is not supported in this browser.');
        }

        // Request video access only (no audio)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access error:', err);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera permission denied. Please enable camera access to continue.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera device was found on your system.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application.');
        } else {
          setError(err.message || 'Failed to start video stream.');
        }
      }
    }

    startCamera();

    // Clean up function: stop all video tracks on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Ensure canvas remains synchronized on window resize
  useEffect(() => {
    window.addEventListener('resize', syncCanvasDimensions);
    return () => {
      window.removeEventListener('resize', syncCanvasDimensions);
    };
  }, [syncCanvasDimensions]);

  if (error) {
    return (
      <div className="webcam-error" role="alert">
        <h3>Camera Access Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="webcam-container" ref={containerRef}>
      <div className="webcam-status-badge">
        <span className="status-dot"></span>
        <span className="status-text">Camera Active</span>
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={syncCanvasDimensions}
        className="webcam-video"
      />
      <canvas
        ref={canvasRef}
        className="webcam-canvas"
      />
    </div>
  );
}
