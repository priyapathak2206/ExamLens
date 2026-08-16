import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import './Webcam.css';

/**
 * Webcam Component with Dual AI Detection:
 * 1. Face Detection (TinyFaceDetector via face-api.js)
 * 2. Mobile Phone Detection (COCO-SSD via TensorFlow.js)
 */
export default function Webcam({ onFaceStatusChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const cocoModelRef = useRef(null);
  const lastLoggedFlagsRef = useRef({});

  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionState, setDetectionState] = useState({
    faceCount: null,
    isPhoneDetected: false,
    phoneConfidence: 0,
  });

  const FLAG_COOLDOWN_MS = 3000; // 3 seconds cooldown per flag type

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

  // Log flag events with debouncing / cooldown to prevent console spam
  const emitFlagEvent = useCallback((flagEvent) => {
    const now = Date.now();
    const lastLogged = lastLoggedFlagsRef.current[flagEvent.type] || 0;

    if (now - lastLogged > FLAG_COOLDOWN_MS) {
      lastLoggedFlagsRef.current[flagEvent.type] = now;
      console.warn('[EXAMLENS PROCTORING FLAG]', flagEvent);
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

  // 2. Load Local AI Models (face-api TinyFaceDetector & TF.js COCO-SSD)
  useEffect(() => {
    let isMounted = true;

    async function loadModels() {
      try {
        // Ensure TensorFlow.js backend is initialized
        await tf.ready();

        // Load Face Detection model from local public directory
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

        // Load Object Detection model (COCO-SSD) for phone detection
        try {
          const cocoModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
          if (isMounted) {
            cocoModelRef.current = cocoModel;
          }
        } catch (cocoErr) {
          console.warn('COCO-SSD model failed to load, phone detection disabled:', cocoErr);
        }

        if (isMounted) {
          setIsModelLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load face detection model:', err);
        if (isMounted) {
          setError('Failed to load local AI detection models.');
        }
      }
    }

    loadModels();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Continuous Detection Loop (Faces + Mobile Phones)
  useEffect(() => {
    let animationFrameId = null;
    let isMounted = true;

    const runDetections = async () => {
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
            // A. Face Detection
            const faceOptions = new faceapi.TinyFaceDetectorOptions({
              inputSize: 224,
              scoreThreshold: 0.45,
            });
            const faceDetections = await faceapi.detectAllFaces(video, faceOptions);

            // B. Object Detection (Phone)
            let phoneDetections = [];
            if (cocoModelRef.current) {
              const predictions = await cocoModelRef.current.detect(video);
              phoneDetections = predictions.filter(
                (p) =>
                  (p.class.toLowerCase() === 'cell phone' || p.class.toLowerCase() === 'phone') &&
                  p.score >= 0.45
              );
            }

            if (isMounted) {
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, width, height);

              const faceCount = faceDetections.length;
              const hasPhone = phoneDetections.length > 0;
              const maxPhoneConfidence = hasPhone
                ? Math.max(...phoneDetections.map((p) => p.score))
                : 0;

              // 1. Draw Face Bounding Boxes
              const displaySize = { width, height };
              const resizedFaceDetections = faceapi.resizeResults(faceDetections, displaySize);

              resizedFaceDetections.forEach((det) => {
                const { x, y, width: boxW, height: boxH } = det.box;
                const isViolation = faceCount > 1 || faceCount === 0;

                ctx.strokeStyle = isViolation ? '#ef4444' : '#10b981';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, boxW, boxH);

                const label = faceCount === 1 ? '1 FACE DETECTED' : `${faceCount} FACES DETECTED`;
                ctx.fillStyle = isViolation ? '#ef4444' : '#10b981';
                ctx.fillRect(x, Math.max(0, y - 22), Math.min(boxW, 140), 22);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px system-ui, sans-serif';
                ctx.fillText(label, x + 6, Math.max(14, y - 6));
              });

              // 2. Draw Mobile Phone Bounding Boxes
              phoneDetections.forEach((phone) => {
                const [x, y, boxW, boxH] = phone.bbox;
                const scorePercent = Math.round(phone.score * 100);

                ctx.strokeStyle = '#f97316';
                ctx.lineWidth = 3.5;
                ctx.strokeRect(x, y, boxW, boxH);

                ctx.fillStyle = '#f97316';
                ctx.fillRect(x, Math.max(0, y - 22), Math.min(boxW, 160), 22);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px system-ui, sans-serif';
                ctx.fillText(`PHONE DETECTED (${scorePercent}%)`, x + 6, Math.max(14, y - 6));
              });

              // 3. Evaluate & Emit Flags with Cooldown
              if (faceCount === 0) {
                emitFlagEvent({
                  type: 'missing_face',
                  confidence: 1.0,
                  rule: 'face_count === 0',
                  timestamp: new Date().toISOString(),
                });
              } else if (faceCount > 1) {
                const avgFaceConfidence =
                  faceDetections.reduce((acc, d) => acc + d.score, 0) / faceCount;
                emitFlagEvent({
                  type: 'multiple_faces',
                  confidence: Number(avgFaceConfidence.toFixed(2)),
                  rule: 'face_count > 1',
                  timestamp: new Date().toISOString(),
                });
              }

              if (hasPhone) {
                emitFlagEvent({
                  type: 'phone_detected',
                  confidence: Number(maxPhoneConfidence.toFixed(2)),
                  rule: 'cell phone detected in webcam frame',
                  timestamp: new Date().toISOString(),
                });
              }

              setDetectionState({
                faceCount,
                isPhoneDetected: hasPhone,
                phoneConfidence: maxPhoneConfidence,
              });
            }
          } catch (err) {
            console.error('Detection frame error:', err);
          }
        }
      }

      if (isMounted) {
        setTimeout(() => {
          animationFrameId = requestAnimationFrame(runDetections);
        }, 100);
      }
    };

    if (isModelLoaded && isStreaming) {
      runDetections();
    }

    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isModelLoaded, isStreaming, emitFlagEvent]);

  // Sync canvas on window resize
  useEffect(() => {
    window.addEventListener('resize', syncCanvasDimensions);
    return () => {
      window.removeEventListener('resize', syncCanvasDimensions);
    };
  }, [syncCanvasDimensions]);

  // Derive status text and type according to requirements:
  // - If phone detected: "Phone detected"
  // - If faceCount === 0: "No face detected"
  // - If faceCount === 1: "1 face detected"
  // - If faceCount > 1: "Multiple faces detected"
  const getStatusInfo = useCallback(() => {
    if (!isModelLoaded) {
      return { text: 'Loading AI Models...', type: 'loading' };
    }
    if (detectionState.faceCount === null) {
      return { text: 'Detecting...', type: 'loading' };
    }
    if (detectionState.isPhoneDetected) {
      return { text: 'Phone detected', type: 'phone' };
    }
    if (detectionState.faceCount === 0) {
      return { text: 'No face detected', type: 'none' };
    }
    if (detectionState.faceCount === 1) {
      return { text: '1 face detected', type: 'single' };
    }
    return { text: 'Multiple faces detected', type: 'multiple' };
  }, [isModelLoaded, detectionState]);

  const statusInfo = getStatusInfo();

  // Notify parent component of status changes only when text or type primitive values change
  useEffect(() => {
    if (onFaceStatusChange) {
      onFaceStatusChange(statusInfo);
    }
  }, [statusInfo.text, statusInfo.type, onFaceStatusChange]);

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
