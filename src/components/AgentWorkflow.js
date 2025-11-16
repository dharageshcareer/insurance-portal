import React, { useState, useEffect } from 'react';
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

  // --- THE FIX IS HERE ---
  // This effect will run ONLY when the 'isRunning' state changes.
  useEffect(() => {
    // We only care about the moment the agent STOPS running.
    if (!isRunning) {
      // If it has stopped AND we received a final response during the run,
      // NOW is the correct time to switch to the decision tab.
      if (finalResponse) {
        setActiveTab('decision');
      }
    }
  }, [isRunning, finalResponse]); // Dependency array ensures this runs on state change

  const handleRun = () => {
    if (!caseDetails) return;

    setIsRunning(true);
    setTimelineEvents([]);
    setFinalResponse(null);
    setError(null);
    setActiveTab('flow'); // Always start a new run on the flow tab
    onStateChange(true);

    const handleApiEvent = (event) => {
      // This function now ONLY updates state, it doesn't trigger UI changes.
      setTimelineEvents(prev => [...prev, event]);
      
      if (event.type === 'final_decision') {
        setFinalResponse(event.data);
      } else if (event.type === 'error') {
        setError(event.message);
      }
      
      // We check if the stream is truly over in the apiService,
      // which will cause isRunning to be set to false.
    };

    // The logic to set isRunning to false has been moved to a final 'stream_end' event
    // that our apiService will now send.
    runAgentFunction(caseDetails, handleApiEvent, 
      () => { // This is the onComplete callback
        setIsRunning(false);
        onStateChange(false);
      },
      (errorMessage) => { // This is the onError callback
        setError(errorMessage);
        setIsRunning(false);
        onStateChange(false);
      }
    );
  };

  return (
    <div className="agent-workflow-container">
      <div className="workflow-header">
        <button onClick={handleRun} disabled={isDisabled || isRunning}>
          {isRunning ? 'Running...' : buttonText}
        </button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      {/* Show the tabbed interface only after the run has been initiated */}
      {(isRunning || finalResponse || error) && (
        <div className="workflow-tabs">
          <div className="tab-headers">
            <button 
              onClick={() => setActiveTab('flow')} 
              className={activeTab === 'flow' ? 'active' : ''}>
                Processing Flow
            </button>
            <button 
              onClick={() => setActiveTab('decision')} 
              className={activeTab === 'decision' ? 'active' : ''} 
              disabled={!finalResponse}>
                Final Decision
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'flow' && <FlowTab events={timelineEvents} />}
            {activeTab === 'decision' && (
              finalResponse 
                ? <ResultsCard type={responseType} response={finalResponse} title="Decision" />
                : <div className="flow-placeholder">The final decision will be displayed here upon completion.</div>
            )}
          </div>
        </div>
      )}
       
      {isRunning && <div className="loader" style={{ marginTop: '20px', alignSelf: 'center' }}></div>}
    </div>
  );
};

export default AgentWorkflow