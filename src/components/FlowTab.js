import React from 'react';
import './FlowTab.css'; // We will create this next

const EventIcon = ({ type }) => {
  let icon = '💬'; // Default
  if (type === 'session') icon = '🔗';
  if (type === 'tool_call') icon = '🛠️';
  if (type === 'tool_response') icon = '📄';
  return <span className="flow-event-icon">{icon}</span>;
};

const FlowTab = ({ events }) => {
  if (!events || events.length === 0) {
    return <div className="flow-placeholder">The agent's workflow steps will appear here.</div>;
  }

  // Filter out final decision, it has its own tab
  const flowEvents = events.filter(e => e.type !== 'final_decision' && e.type !== 'error');

  return (
    <div className="flow-container">
      {flowEvents.map((event, index) => (
        <div key={index} className="flow-event">
          <EventIcon type={event.type} />
          <div className="flow-event-content">
            <strong>{event.type.replace('_', ' ')}</strong>
            {event.toolName && <span className="tool-name">{event.toolName}</span>}
            {event.args && (
              <div className="event-details">
                <p>Arguments:</p>
                <pre>{JSON.stringify(event.args, null, 2)}</pre>
              </div>
            )}
            {event.type === 'tool_response' && (
              <div className="event-details">
                <p>Result:</p>
                <pre>{event.message}</pre>
              </div>
            )}
             {event.type === 'session' && (
              <div className="event-details">
                <p>{event.message}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlowTab;