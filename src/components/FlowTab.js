import React from 'react';
import './FlowTab.css';

// A small sub-component for the agent "chapter" header
const AgentHeader = ({ author }) => (
  <div className="agent-header">
    <span className="agent-icon">🤖</span>
    <div className="agent-header-text">
      <span>Agent Active</span>
      <strong>{author}</strong>
    </div>
  </div>
);

const EventIcon = ({ type }) => {
  let icon = '💬';
  if (type === 'session') icon = '🔗';
  if (type === 'tool_call') icon = '🛠️';
  if (type === 'tool_response') icon = '📄';
  return <span className="flow-event-icon">{icon}</span>;
};

const FlowTab = ({ events }) => {
  if (!events || events.length === 0) {
    return <div className="flow-placeholder">The agent's workflow steps will appear here.</div>;
  }

  const flowEvents = events.filter(e => e.type !== 'final_decision' && e.type !== 'error');
  let currentAgent = null; // To track when the agent changes

  return (
    <div className="flow-container">
      {flowEvents.map((event, index) => {
        // Check if the agent has changed for this event
        const agentChanged = event.author && event.author !== currentAgent;
        if (agentChanged) {
          currentAgent = event.author;
        }

        return (
          <React.Fragment key={index}>
            {/* If the agent changed, render the header first */}
            {agentChanged && <AgentHeader author={currentAgent} />}

            <div className="flow-event">
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
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default FlowTab;