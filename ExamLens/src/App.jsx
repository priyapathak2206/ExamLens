import Webcam from './components/Webcam'
import './App.css'

function App() {
  return (
    <div className="exam-container">
      {/* ExamLens Page Heading */}
      <header className="exam-header">
        <h1 className="exam-title">ExamLens</h1>
        <p className="exam-subtitle">AI Proctoring System — Member 1 Detection Engine</p>
      </header>

      {/* Centered Proctoring Card */}
      <main className="exam-card-wrapper">
        <div className="proctor-card">
          <div className="card-top-bar">
            <span className="card-label">Proctoring Feed</span>
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">Camera Active</span>
            </div>
          </div>

          <div className="card-body">
            <Webcam />
          </div>

          <div className="card-footer">
            <div className="instruction-banner">
              <svg
                className="info-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Keep your face visible and remain in the exam window.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
