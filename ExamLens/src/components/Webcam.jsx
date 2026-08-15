import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import './Webcam.css';

/**
 * Webcam Component with Real-Time Browser Face Detection
 * Continuously detects faces using TinyFaceDetector and draws bounding boxes on canvas.
 */
export default function Webcam({ onFaceStatusChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [faceCount, setFaceCount] = useState(null);

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

  // 1. Initialize Webcam Stream
  useEffect(() => {
    let stream = null;

    async function startCamera() {
      setError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('MediaDevices getUserMedia API is not supported in this browser.');
        }

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

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Load Minimum Face Detection Model (TinyFaceDetector)
  useEffect(() => {
    async function loadModel() {
      try {
        // Load tiny face detector weights from local public directory
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Failed to load face detection model:', err);
        setError('Failed to load face detection AI model.');
      }
    }

    loadModel();
  }, []);

  // 3. Continuous Face Detection Loop
  useEffect(() => {
    let animationFrameId = null;
    let isMounted = true;

    const detectFaces = async () => {
      if (!isMounted) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        isModelLoaded &&
        video &&
        canvas &&
        !video.paused &&
        !video.ended &&
        video.readyState >= 2
      ) {
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width > 0 && height > 0) {
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          try {
            const options = new faceapi.TinyFaceDetectorOptions({
              inputSize: 224,
              scoreThreshold: 0.45,
            });

            const detections = await faceapi.detectAllFaces(video, options);

            if (isMounted) {
              const displaySize = { width, height };
              const resizedDetections = faceapi.resizeResults(detections, displaySize);

              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, width, height);

              const count = detections.length;

              // Draw bounding box around every detected face
              resizedDetections.forEach((det) => {
                const { x, y, width: boxW, height: boxH } = det.box;
                const isViolation = count > 1 || count === 0;

                ctx.strokeStyle = isViolation ? '#ef4444' : '#10b981';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, boxW, boxH);

                // Draw bounding box header label
                const label = count === 1 ? '1 FACE DETECTED' : `${count} FACES DETECTED`;
                ctx.fillStyle = isViolation ? '#ef4444' : '#10b981';
                ctx.fillRect(x, Math.max(0, y - 22), Math.min(boxW, 140), 22);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px system-ui, sans-serif';
                ctx.fillText(label, x + 6, Math.max(14, y - 6));
              });

              setFaceCount(count);
            }
          } catch (err) {
            console.error('Detection frame error:', err);
          }
        }
      }

      if (isMounted) {
        // Run detection every 100ms for smooth continuous detection
        setTimeout(() => {
          animationFrameId = requestAnimationFrame(detectFaces);
        }, 100);
      }
    };

    if (isModelLoaded && isStreaming) {
      detectFaces();
    }

    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isModelLoaded, isStreaming]);

  // Sync canvas on window resize
  useEffect(() => {
    window.addEventListener('resize', syncCanvasDimensions);
    return () => {
      window.removeEventListener('resize', syncCanvasDimensions);
    };
  }, [syncCanvasDimensions]);

  // Derive status text according to requirements:
  // 10. "No face detected" (count === 0)
  // 11. "1 face detected" (count === 1)
  // 12. "Multiple faces detected" (count > 1)
  const getStatusInfo = () => {
    if (!isModelLoaded) {
      return { text: 'Loading AI Model...', type: 'loading' };
    }
    if (faceCount === null) {
      return { text: 'Detecting...', type: 'loading' };
    }
    if (faceCount === 0) {
      return { text: 'No face detected', type: 'none' };
    }
    if (faceCount === 1) {
      return { text: '1 face detected', type: 'single' };
    }
    return { text: 'Multiple faces detected', type: 'multiple' };
  };

  const statusInfo = getStatusInfo();

  // Notify parent component of face status changes
  useEffect(() => {
    if (onFaceStatusChange) {
      onFaceStatusChange(statusInfo);
    }
  }, [statusInfo, onFaceStatusChange]);


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
      <div className={`webcam-status-badge badge-${statusInfo.type}`}>
        <span className="status-dot"></span>
        <span className="status-text">{statusInfo.text}</span>
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlaying={() => setIsStreaming(true)}
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
