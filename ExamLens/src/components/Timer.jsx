import { useState, useEffect, useRef } from 'react';
import './Timer.css';

/**
 * Timer Component:
 * 30-minute countdown timer with 5-minute warning state and auto-finish on 00:00.
 */
export default function Timer({ initialSeconds = 1800, onTimeUp, isSubmitted }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (isSubmitted || secondsLeft <= 0) return;

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isSubmitted, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = secondsLeft > 0 && secondsLeft < 300; // Less than 5 minutes
  const isTimeUp = secondsLeft === 0;

  return (
    <div className={`timer-box ${isWarning ? 'timer-warning' : ''} ${isTimeUp ? 'timer-danger' : ''}`}>
      <svg
        className="timer-icon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <div className="timer-text-group">
        <span className="timer-label">{isTimeUp ? "Time's Up" : 'Time Remaining'}</span>
        <span className="timer-value">{formattedTime}</span>
      </div>
    </div>
  );
}
