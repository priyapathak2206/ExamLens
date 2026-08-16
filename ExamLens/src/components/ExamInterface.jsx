import { useState, useCallback } from 'react';
import Webcam from './Webcam';
import ProctoringActivity from './ProctoringActivity';
import QuestionCard from './QuestionCard';
import QuestionNav from './QuestionNav';
import Timer from './Timer';
import { generateRandomizedExam } from '../data/questions';
import './ExamInterface.css';

/**
 * ExamInterface Component:
 * Complete Online Examination Platform with Randomized Attempts & Real-Time AI Proctoring.
 */
export default function ExamInterface() {
  const [examState, setExamState] = useState('start'); // 'start' | 'in_progress' | 'submitted'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [attemptKey, setAttemptKey] = useState(1);
  const [events, setEvents] = useState([]);
  const [faceStatus, setFaceStatus] = useState({
    text: 'Camera Active',
    type: 'loading',
  });

  const totalQuestions = questions.length || 10;

  // Handle status change from Webcam component
  const handleFaceStatusChange = useCallback((newStatus) => {
    setFaceStatus((prev) => {
      if (prev.text === newStatus.text && prev.type === newStatus.type) {
        return prev;
      }
      return newStatus;
    });
  }, []);

  // Handle proctoring flag events from Webcam component
  const handleFlagEvent = useCallback((newEvent) => {
    setEvents((prevEvents) => {
      const eventWithId = {
        ...newEvent,
        id: `${newEvent.type}-${Date.now()}-${Math.random()}`,
      };
      return [eventWithId, ...prevEvents].slice(0, 10);
    });
  }, []);

  // Start a fresh exam attempt with newly randomized questions & options
  const startNewExamAttempt = () => {
    const randomizedQuestions = generateRandomizedExam();
    setQuestions(randomizedQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setAttemptKey((prev) => prev + 1);
    setExamState('in_progress');
  };

  // Select an option for a question
  const handleSelectOption = (qIndex, optionIdx) => {
    if (examState === 'submitted') return;
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIdx,
    }));
  };

  // Prev / Next navigation
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex((prev) => prev + 1);
  };

  // Submit exam workflow
  const handleOpenSubmitModal = () => {
    if (examState === 'submitted') return;
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setExamState('submitted');
    setShowConfirmModal(false);
  };

  const handleTimeUp = useCallback(() => {
    setExamState((prev) => {
      if (prev === 'in_progress') {
        setShowConfirmModal(false);
        return 'submitted';
      }
      return prev;
    });
  }, []);

  // Calculate detailed score statistics
  const calculateResults = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    questions.forEach((q, idx) => {
      const userAns = answers[idx];
      if (userAns === undefined || userAns === null) {
        unansweredCount += 1;
      } else if (userAns === q.correctAnswer) {
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }
    });

    const total = questions.length || 1;
    const percentage = Math.round((correctCount / total) * 100);

    return {
      score: correctCount,
      total,
      percentage,
      correctCount,
      incorrectCount,
      unansweredCount,
    };
  };

  const results = calculateResults();

  return (
    <div className="exam-app">
      {/* Top Header Bar */}
      <header className="exam-top-header">
        <div className="header-brand">
          <div className="brand-logo">EL</div>
          <div className="brand-info">
            <h1 className="brand-title">ExamLens</h1>
            <span className="brand-subtitle">Online Assessment — B.Tech CS / IT</span>
          </div>
        </div>

        <div className="header-actions">
          {examState === 'in_progress' && (
            <Timer
              key={attemptKey}
              initialSeconds={1800}
              onTimeUp={handleTimeUp}
              isSubmitted={examState === 'submitted'}
            />
          )}
          <div className={`proctor-status-chip status-${faceStatus.type}`}>
            <span className="status-dot"></span>
            <span className="status-text">{faceStatus.text}</span>
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <main className="exam-main-layout">
        {/* Left / Primary Column */}
        <section className="exam-primary-column">
          {examState === 'start' && (
            <div className="start-exam-card">
              <div className="start-card-header">
                <div className="start-card-logo">⚡</div>
                <h2 className="start-title">Online Technical Assessment</h2>
                <p className="start-subtitle">
                  Welcome to ExamLens. Please ensure your camera and microphone are ready before proceeding.
                </p>
              </div>

              <div className="start-meta-pills">
                <div className="meta-pill">
                  <span className="pill-icon">📋</span>
                  <span>10 MCQ Questions</span>
                </div>
                <div className="meta-pill">
                  <span className="pill-icon">⏱️</span>
                  <span>30 Minutes Duration</span>
                </div>
                <div className="meta-pill">
                  <span className="pill-icon">🛡️</span>
                  <span>AI Proctoring Active</span>
                </div>
              </div>

              <div className="instructions-section">
                <h3 className="instructions-title">Candidate Rules & Guidelines:</h3>
                <ul className="instructions-list">
                  <li>Your webcam stream will be monitored in real-time by AI proctoring engines.</li>
                  <li>Ensure your face remains clearly visible within the camera frame at all times.</li>
                  <li>Usage of mobile phones or secondary smart devices is strictly prohibited.</li>
                  <li>Do not switch tabs, minimize the browser window, or open external applications.</li>
                  <li>The exam will automatically submit when the 30-minute timer reaches 00:00.</li>
                </ul>
              </div>

              <button
                type="button"
                className="btn-start-exam"
                onClick={startNewExamAttempt}
              >
                Start Exam
              </button>
            </div>
          )}

          {examState === 'in_progress' && questions.length > 0 && (
            <QuestionCard
              question={questions[currentIndex]}
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              selectedOption={answers[currentIndex]}
              onSelectOption={handleSelectOption}
              onPrev={handlePrev}
              onNext={handleNext}
              onSubmit={handleOpenSubmitModal}
              isSubmitted={false}
            />
          )}

          {examState === 'submitted' && (
            <div className="result-card">
              <div className="result-header">
                <div className="result-badge-icon">🏆</div>
                <h2 className="result-title">Exam Submitted</h2>
                <p className="result-subtitle">
                  Your assessment results have been calculated. Below is your detailed breakdown.
                </p>
              </div>

              <div className="result-score-grid">
                <div className="score-stat-box">
                  <span className="stat-label">Final Score</span>
                  <span className="stat-value">{results.score} / {results.total}</span>
                </div>
                <div className="score-stat-box">
                  <span className="stat-label">Percentage</span>
                  <span className="stat-value">{results.percentage}%</span>
                </div>
                <div className="score-stat-box">
                  <span className="stat-label">Correct Answers</span>
                  <span className="stat-value text-correct">{results.correctCount}</span>
                </div>
                <div className="score-stat-box">
                  <span className="stat-label">Incorrect Answers</span>
                  <span className="stat-value text-incorrect">{results.incorrectCount}</span>
                </div>
                <div className="score-stat-box">
                  <span className="stat-label">Unanswered</span>
                  <span className="stat-value text-unanswered">{results.unansweredCount}</span>
                </div>
              </div>

              <div className="result-actions">
                <button
                  type="button"
                  className="btn-start-new-exam"
                  onClick={startNewExamAttempt}
                >
                  🔄 Start New Exam
                </button>
              </div>

              <h3 className="breakdown-heading">Question Itemized Review</h3>
              <div className="result-breakdown-list">
                {questions.map((q, idx) => {
                  const userAnswer = answers[idx];
                  const isCorrect = userAnswer === q.correctAnswer;
                  const isAnswered = userAnswer !== undefined && userAnswer !== null;

                  return (
                    <div
                      key={q.id || idx}
                      className={`breakdown-item ${isCorrect ? 'item-correct' : isAnswered ? 'item-incorrect' : 'item-unanswered'}`}
                    >
                      <div className="breakdown-item-header">
                        <span className="breakdown-q-num">Q{idx + 1}.</span>
                        <span className="breakdown-q-text">{q.question}</span>
                        <span className={`breakdown-status-tag ${isCorrect ? 'tag-correct' : isAnswered ? 'tag-incorrect' : 'tag-unanswered'}`}>
                          {isCorrect ? 'Correct' : isAnswered ? 'Incorrect' : 'Not Attempted'}
                        </span>
                      </div>
                      <div className="breakdown-answers">
                        <span className="ans-label">Your Answer: </span>
                        <span className="ans-val">
                          {isAnswered ? `${['A','B','C','D'][userAnswer]}. ${q.options[userAnswer]}` : 'None'}
                        </span>
                        {!isCorrect && (
                          <>
                            <span className="ans-label right-ans-label"> | Correct: </span>
                            <span className="ans-val right-ans-val">
                              {['A','B','C','D'][q.correctAnswer]}. {q.options[q.correctAnswer]}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Right / Secondary Side Column */}
        <aside className="exam-side-column">
          {/* Proctoring Live Feed Card */}
          <div className="proctor-feed-card">
            <div className="feed-card-header">
              <span className="card-label">Proctoring Feed</span>
              <div className={`status-indicator status-${faceStatus.type}`}>
                <span className="status-dot"></span>
                <span className="status-text">{faceStatus.text}</span>
              </div>
            </div>

            <div className="feed-card-body">
              <Webcam
                onFaceStatusChange={handleFaceStatusChange}
                onFlagEvent={handleFlagEvent}
              />
            </div>
          </div>

          {/* Question Navigation Grid (Visible during active exam) */}
          {examState === 'in_progress' && questions.length > 0 && (
            <QuestionNav
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              answers={answers}
              onSelectQuestion={(idx) => setCurrentIndex(idx)}
            />
          )}

          {/* Proctoring Activity Log */}
          <ProctoringActivity events={events} />
        </aside>
      </main>

      {/* Confirmation Submit Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content" role="dialog" aria-modal="true">
            <div className="modal-icon">📝</div>
            <h3 className="modal-title">Submit Assessment?</h3>
            <p className="modal-desc">
              Are you sure you want to submit the exam? You have answered{' '}
              <strong>{Object.keys(answers).length}</strong> of{' '}
              <strong>{totalQuestions}</strong> questions.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-submit"
                onClick={handleConfirmSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
