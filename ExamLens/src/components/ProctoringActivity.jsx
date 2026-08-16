import './ProctoringActivity.css';

/**
 * ProctoringActivity Component:
 * Displays a real-time log of proctoring events emitted by the detection engine.
 * Keeps up to 10 latest events, ordered newest first.
 */
export default function ProctoringActivity({ events = [] }) {
  // Helper to resolve readable labels, descriptions, icons, and severity badges
  const getEventMeta = (event) => {
    switch (event.type) {
      case 'phone_detected':
        return {
          title: 'Phone Detected',
          description: 'Mobile phone identified in webcam feed',
          severity: 'high',
          badgeClass: 'severity-high',
          icon: '📱',
        };
      case 'tab_switch':
        return {
          title: 'Tab Switched',
          description: 'Browser tab focus lost (document hidden)',
          severity: 'high',
          badgeClass: 'severity-high',
          icon: '⚠️',
        };
      case 'missing_face':
        return {
          title: 'Face Not Detected',
          description: 'Candidate face missing from webcam view',
          severity: 'medium',
          badgeClass: 'severity-medium',
          icon: '👤',
        };
      case 'multiple_faces':
        return {
          title: 'Multiple Faces Detected',
          description: 'Multiple people detected in webcam view',
          severity: 'high',
          badgeClass: 'severity-high',
          icon: '👥',
        };
      default:
        return {
          title: (event.type || 'FLAG').replace('_', ' ').toUpperCase(),
          description: event.rule || 'Proctoring flag event emitted',
          severity: 'info',
          badgeClass: 'severity-info',
          icon: '🔔',
        };
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section className="activity-card" aria-label="Proctoring Activity Log">
      <div className="activity-header">
        <div className="activity-title-group">
          <svg
            className="activity-header-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <h2 className="activity-title">Proctoring Activity</h2>
        </div>
        <span className="activity-badge-count">
          {events.length} {events.length === 1 ? 'Event' : 'Events'}
        </span>
      </div>

      <div className="activity-body">
        {events.length === 0 ? (
          <div className="activity-empty-state">
            <svg
              className="empty-icon"
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p className="empty-text">No proctoring violations recorded</p>
            <span className="empty-subtext">Camera feed and exam window are clear.</span>
          </div>
        ) : (
          <ul className="activity-list">
            {events.map((event) => {
              const meta = getEventMeta(event);
              return (
                <li key={event.id || `${event.type}-${event.timestamp}`} className="activity-item">
                  <div className="activity-item-icon" aria-hidden="true">
                    {meta.icon}
                  </div>
                  <div className="activity-item-content">
                    <div className="activity-item-top">
                      <span className="activity-item-title">{meta.title}</span>
                      <span className={`severity-badge ${meta.badgeClass}`}>
                        {meta.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="activity-item-desc">{meta.description}</p>
                  </div>
                  <div className="activity-item-time">{formatTime(event.timestamp)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
