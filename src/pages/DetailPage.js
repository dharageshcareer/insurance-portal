import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// The import for AgentWorkflow was missing in my previous response, adding it back.
import AgentWorkflow from '../components/AgentWorkflow'; 
import { runEligibilityAgent, runPreAuthAgent } from '../services/apiService';
import './DetailPage.css';

function DetailPage({ cases }) {
  const { requestId } = useParams();
  const [caseDetails, setCaseDetails] = useState(null);
  
  // State for the PATIENT details tabs (Diagnosis, etc.)
  const [activeClinicalTab, setActiveClinicalTab] = useState('diagnosis');
  
  // State for the top-level AGENT tabs (Eligibility vs. Pre-Auth)
  const [activeAgentTab, setActiveAgentTab] = useState('eligibility');
  
  // A single state to track if ANY agent is running to disable all buttons
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  useEffect(() => {
    const details = cases.find(c => c.requestId === requestId);
    setCaseDetails(details);
  }, [requestId, cases]);

  // The logic inside AgentWorkflow.js now handles the onComplete callbacks,
  // so we don't need to pass them down from here. This simplifies the props.

  if (!caseDetails) {
    return <div className="loading">Loading case details...</div>;
  }
  
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
          <button onClick={() => setActiveClinicalTab('diagnosis')} className={activeClinicalTab === 'diagnosis' ? 'active' : ''}>Diagnosis</button>
          <button onClick={() => setActiveClinicalTab('summary')} className={activeClinicalTab === 'summary' ? 'active' : ''}>Clinical Summary</button>
          <button onClick={() => setActiveClinicalTab('documents')} className={activeClinicalTab === 'documents' ? 'active' : ''}>Documents Submitted</button>
        </div>
        <div className="tab-content">
          {activeClinicalTab === 'diagnosis' && <div><h4>Primary Diagnosis</h4><p>{caseDetails.clinicalDetails.diagnosis}</p><h4>Symptoms</h4><p>{caseDetails.clinicalDetails.symptoms}</p></div>}
          {activeClinicalTab === 'summary' && <ul>{caseDetails.clinicalDetails.clinicalHistory.map((item, index) => <li key={index}>{item}</li>)}</ul>}
          {activeClinicalTab === 'documents' && <ul>{caseDetails.clinicalDetails.documents.map((doc, index) => <li key={index}>{doc.name} <span>({doc.size})</span></li>)}</ul>}
        </div>
      </div>

      {/* --- AGENT ACTIONS SECTION --- */}
      <div className="actions-section section-card">
        <h2>Agent Actions</h2>
        
        {/* --- TOP-LEVEL TABS --- */}
        <div className="agent-tabs-header">
            {/* --- THIS IS THE CORRECTED LINE --- */}
            <button 
              onClick={() => setActiveAgentTab('eligibility')} 
              className={activeAgentTab === 'eligibility' ? 'active' : ''} 
              disabled={isAgentRunning}>
                Eligibility Check
            </button>
            {/* --- THIS IS THE SECOND CORRECTED LINE --- */}
            <button 
              onClick={() => setActiveAgentTab('preauth')} 
              className={activeAgentTab === 'preauth' ? 'active' : ''} 
              disabled={isAgentRunning}>
                Pre-Authorization
            </button>
        </div>

        {/* --- Conditionally Rendered Agent Workflows --- */}
        <div className="agent-tabs-content">
            {activeAgentTab === 'eligibility' && (
                <AgentWorkflow
                    buttonText="Run Eligibility Agent"
                    runAgentFunction={runEligibilityAgent}
                    caseDetails={caseDetails}
                    responseType="eligibility"
                    isDisabled={isAgentRunning}
                    onStateChange={setIsAgentRunning}
                />
            )}
            
            {activeAgentTab === 'preauth' && (
                <AgentWorkflow
                    buttonText="Run Pre-Auth Agent"
                    runAgentFunction={runPreAuthAgent}
                    caseDetails={caseDetails}
                    responseType="preauth"
                    isDisabled={isAgentRunning}
                    onStateChange={setIsAgentRunning}
                />
            )}
        </div>
      </div>
    </div>
  );
}

export default DetailPage;