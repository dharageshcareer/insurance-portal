import React, { useState } from 'react';
import FlowTab from './FlowTab';
import ResultsCard from './ResultsCard';
import '../components/Loader.css';
import './AgentWorkflow.css'; 

const AgentWorkflow = ({
  title,
  buttonText,
  runAgentFunction,
  caseDetails,
  responseType,
  isDisabled,
  onStateChange,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [finalResponse, setFinalResponse] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('flow');

  const handleRun = () => {
    if (!caseDetails) return;

    setIsRunning(true);
    setTimelineEvents([]);
    setFinalResponse(null);
    setError(null);
    setActiveTab('flow');
    onStateChange(true);

    const handleApiEvent = (event) => {
      setTimelineEvents(prev => [...prev, event]);
      
      if (event.type === 'final_decision' || event.type === 'error') {
        if (event.type === 'final_decision') {
          setFinalResponse(event.data);
          setActiveTab('decision');
        }
        if (event.type === 'error') setError(event.message);
        setIsRunning(false);
        onStateChange(false);
      }
    };

    runAgentFunction(caseDetails, handleApiEvent, (errorMessage) => {
      setError(errorMessage);
      setIsRunning(false);
      onStateChange(false);
    });
  };

  return (
    <div className="agent-workflow-container">
      <div className="workflow-header">
        <h3>{title}</h3>
        <button onClick={handleRun} disabled={isDisabled || isRunning}>
          {isRunning ? 'Running...' : buttonText}
        </button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      {(isRunning || finalResponse || error) && (
        <div className="workflow-tabs">
          <div className="tab-headers">
            <button onClick={() => setActiveTab('flow')} className={activeTab === 'flow' ? 'active' : ''}>Processing Flow</button>
            <button onClick={() => setActiveTab('decision')} className={activeTab === 'decision' ? 'active' : ''} disabled={!finalResponse}>Final Decision</button>
          </div>
          <div className="tab-content">
            {activeTab === 'flow' && <FlowTab events={timelineEvents} />}
            {activeTab === 'decision' && (
              finalResponse 
                ? <ResultsCard type={responseType} response={finalResponse} title="Decision" />
                : <div className="flow-placeholder">The final decision will be displayed here.</div>
            )}
          </div>
        </div>
      )}
       
      {isRunning && <div className="loader" style={{ marginTop: '20px', alignSelf: 'center' }}></div>}
    </div>
  );
};

export default AgentWorkflow;