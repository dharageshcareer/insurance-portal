import React, { useState } from 'react';
import Timeline from './Timeline';
import ResultsCard from './ResultsCard';
import '../components/Loader.css';
import './AgentWorkflow.css'; // We will create this CSS file next

const AgentWorkflow = ({
  title,
  buttonText,
  runAgentFunction,
  caseDetails,
  responseType,
  isDisabled,
  onStateChange, // Callback to notify the parent of running state
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [finalResponse, setFinalResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleRun = () => {
    if (!caseDetails) return;

    // Reset state and notify parent
    setIsRunning(true);
    setTimelineEvents([]);
    setFinalResponse(null);
    setError(null);
    onStateChange(true); // Tell the parent we are starting

    const handleApiEvent = (event) => {
      setTimelineEvents(prev => [...prev, event]);
      
      if (event.type === 'final_decision' || event.type === 'error') {
        if (event.type === 'final_decision') setFinalResponse(event.data);
        if (event.type === 'error') setError(event.message);
        setIsRunning(false);
        onStateChange(false); // Tell the parent we are done
      }
    };

    runAgentFunction(caseDetails, handleApiEvent, (errorMessage) => {
      setError(errorMessage);
      setIsRunning(false);
      onStateChange(false); // Tell the parent we are done (with an error)
    });
  };

  return (
    <div className="agent-workflow-container">
      <h3>{title}</h3>
      <div className="action-buttons">
        <button onClick={handleRun} disabled={isDisabled || isRunning}>
          {isRunning ? 'Running...' : buttonText}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      
      {/* Show timeline only when running and there are events */}
      {isRunning && timelineEvents.length > 0 && <Timeline events={timelineEvents} />}
      
      {/* Show results card only when we have a final response */}
      {finalResponse && <ResultsCard type={responseType} response={finalResponse} title="Decision" />}
      
      {isRunning && <div className="loader" style={{ marginTop: '20px' }}></div>}
    </div>
  );
};

export default AgentWorkflow;