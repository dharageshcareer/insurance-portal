import React, { useState, useEffect } from 'react'; // <-- THIS LINE IS NOW FIXED
import { useParams, Link } from 'react-router-dom';
import { runEligibilityAgent } from '../services/apiService';
import Timeline from '../components/Timeline';
import ResultsCard from '../components/ResultsCard';
import './DetailPage.css';
import '../components/Loader.css';

function DetailPage({ cases }) {
  const { requestId } = useParams();
  const [caseDetails, setCaseDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnosis');

  // State for the entire workflow
  const [isLoading, setIsLoading] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [finalResponse, setFinalResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const details = cases.find(c => c.requestId === requestId);
    setCaseDetails(details);
  }, [requestId, cases]);

  const handleRunEligibility = () => {
    if (!caseDetails) return;

    // Reset state for a new run
    setIsLoading(true);
    setTimelineEvents([]);
    setFinalResponse(null);
    setError(null);

    // Define the callback for handling events from the API service
    const handleApiEvent = (event) => {
      setTimelineEvents(prev => [...prev, event]);
      
      if (event.type === 'final_decision') {
        setFinalResponse(event.data);
        setIsLoading(false);
      } else if (event.type === 'error') {
        setError(event.message);
        setIsLoading(false);
      }
    };

    // Define the callback for handling fatal errors
    const handleApiError = (errorMessage) => {
      setError(errorMessage);
      setIsLoading(false);
    };

    // Call the new agent workflow
    runEligibilityAgent(caseDetails, handleApiEvent, handleApiError);
  };

  if (!caseDetails) {
    return <div className="loading">Loading case details...</div>;
  }
  
  const preAuthIsRequired = finalResponse?.pre_auth_required === true;

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">&larr; Back to Dashboard</Link>
      
      {/* Patient Overview section */}
      <div className="patient-overview section-card">
        <h2>Patient Overview</h2>
        <div className="overview-grid">
          <p><strong>Name:</strong> {caseDetails.patientName}</p>
          <p><strong>Member ID:</strong> {caseDetails.memberId}</p>
          <p><strong>Date of Birth:</strong> {caseDetails.dob}</p>
          <p><strong>Policy ID:</strong> {caseDetails.policyId}</p>
        </div>
      </div>

      {/* Specialization Tabs section */}
      <div className="specialization-tabs section-card">
        <div className="tab-headers">
          <button onClick={() => setActiveTab('diagnosis')} className={activeTab === 'diagnosis' ? 'active' : ''}>Diagnosis</button>
          <button onClick={() => setActiveTab('summary')} className={activeTab === 'summary' ? 'active' : ''}>Clinical Summary</button>
          <button onClick={() => setActiveTab('documents')} className={activeTab === 'documents' ? 'active' : ''}>Documents Submitted</button>
        </div>
        <div className="tab-content">
          {activeTab === 'diagnosis' && <div><h4>Primary Diagnosis</h4><p>{caseDetails.clinicalDetails.diagnosis}</p><h4>Symptoms</h4><p>{caseDetails.clinicalDetails.symptoms}</p></div>}
          {activeTab === 'summary' && <ul>{caseDetails.clinicalDetails.clinicalHistory.map((item, index) => <li key={index}>{item}</li>)}</ul>}
          {activeTab === 'documents' && <ul>{caseDetails.clinicalDetails.documents.map((doc, index) => <li key={index}>{doc.name} <span>({doc.size})</span></li>)}</ul>}
        </div>
      </div>

      {/* --- ACTIONS & RESULTS SECTION --- */}
      <div className="actions-section section-card">
        <h2>Actions</h2>
        <div className="action-buttons">
          <button onClick={handleRunEligibility} disabled={isLoading}>
            {isLoading ? 'Agent is Running...' : 'Run Eligibility Agent'}
          </button>
          <button disabled={!preAuthIsRequired || isLoading}>Run Pre-Auth Agent</button>
        </div>

        {error && <p className="error-message">{error}</p>}
        
        <Timeline events={timelineEvents} />
        
        {finalResponse && <ResultsCard response={finalResponse} title="Eligibility Check Decision" />}

        {isLoading && <div className="loader" style={{ marginTop: '20px' }}></div>}
      </div>
    </div>
  );
}

export default DetailPage;