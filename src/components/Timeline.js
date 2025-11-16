import React from 'react';
import './Timeline.css';

const TimelineIcon = ({ type }) => {
  let icon = '⚙️'; // Default
  if (type === 'session') icon = '🔗';
  if (type === 'tool_call') icon = '🛠️';
  if (type === 'tool_response') icon = '📄';
  if (type === 'final_decision') icon = '✅';
  if (type === 'error') icon = '❌';
  return <span className="timeline-icon">{icon}</span>;
};

const Timeline = ({ events }) => {
  if (!events || events.length === 0) return null;

  // Filter out the final_decision event, as it's handled by the ResultsCard
  const timelineEvents = events.filter(e => e.type !== 'final_decision');

  return (
    <div className="timeline-container">
      <h4>Processing Steps:</h4>
      <div className="timeline">
        {timelineEvents.map((event, index) => (
          <div key={index} className="timeline-item">
            <TimelineIcon type={event.type} />
            <div className="timeline-content">
              <strong>{event.type.replace('_', ' ')}</strong>
              {/* If the event has a toolName, display it prominently */}
              {event.toolName && (
                <span className="tool-name">{event.toolName}</span>
              )}
              <p>{event.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;