import './QuestionCard.css';

/**
 * QuestionCard Component:
 * Displays single multiple-choice question with option selection and prev/next navigation.
 */
export default function QuestionCard({
  question,
  totalQuestions,
  currentIndex,
  selectedOption,
  onSelectOption,
  onPrev,
  onNext,
  onSubmit,
  isSubmitted,
}) {
  if (!question) return null;

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="question-card">
      <div className="question-card-header">
        <span className="question-badge">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        {selectedOption !== undefined && selectedOption !== null && (
          <span className="answered-status-pill">✓ Answer Saved</span>
        )}
      </div>

      <h3 className="question-text">{question.question}</h3>

      <div className="options-group" role="radiogroup" aria-label="Question Options">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              type="button"
              disabled={isSubmitted}
              onClick={() => onSelectOption(currentIndex, idx)}
              className={`option-button ${isSelected ? 'option-selected' : ''}`}
            >
              <span className="option-label">{optionLabels[idx]}</span>
              <span className="option-text">{option}</span>
              <span className="option-radio-indicator">
                {isSelected && <span className="radio-dot" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="question-card-footer">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="btn-secondary"
        >
          ← Previous
        </button>

        <div className="footer-right-actions">
          {currentIndex < totalQuestions - 1 ? (
            <button type="button" onClick={onNext} className="btn-primary">
              Next →
            </button>
          ) : (
            !isSubmitted && (
              <button type="button" onClick={onSubmit} className="btn-submit">
                Submit Exam
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
