import './QuestionNav.css';

/**
 * QuestionNav Component:
 * Grid of question numbers showing status (current = purple, answered = green, unanswered = neutral).
 */
export default function QuestionNav({
  totalQuestions,
  currentIndex,
  answers = {},
  onSelectQuestion,
}) {
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="question-nav-card">
      <div className="nav-header">
        <h4 className="nav-title">Question Navigation</h4>
        <span className="nav-counter">
          {answeredCount}/{totalQuestions} Answered
        </span>
      </div>

      <div className="nav-grid">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[idx] !== undefined && answers[idx] !== null;

          let statusClass = 'nav-unanswered';
          if (isCurrent) {
            statusClass = 'nav-current';
          } else if (isAnswered) {
            statusClass = 'nav-answered';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={`nav-btn ${statusClass}`}
              aria-label={`Question ${idx + 1} ${isCurrent ? '(Current)' : isAnswered ? '(Answered)' : ''}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      <div className="nav-legend">
        <div className="legend-item">
          <span className="legend-dot dot-current" />
          <span>Current</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-answered" />
          <span>Answered ({answeredCount})</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-unanswered" />
          <span>Unanswered ({unansweredCount})</span>
        </div>
      </div>
    </div>
  );
}
