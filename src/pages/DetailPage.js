import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { runEligibilityAgent, runPreAuthAgent } from '../services/apiService';
import AgentWorkflow from '../components/AgentWorkflow';
import CaseOverview from '../components/CaseOverview'; // <-- Import the new component
import './DetailPage.css';

function DetailPage({ cases }) {
  const { requestId } = useParams();
  const [caseDetails, setCaseDetails] = useState(null);
  
  const [activeClinicalTab, setActiveClinicalTab] = useState('diagnosis');
  const [activeAgentTab, setActiveAgentTab] = useState('eligibility');
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  useEffect(() => {
    const details = cases.find(c => c.requestId === requestId);
    setCaseDetails(details);
  }, [requestId, cases]);

  if (!caseDetails) {
    return <div className="loading">Loading case details...</div>;
  }
  
  return (
    <div className="detail-page">
      <Link to="/" className="back-link">&larr; Back to Dashboard</Link>
      
      {/* --- REPLACE THE OLD PATIENT OVERVIEW WITH THE NEW COMPONENT --- */}
      <CaseOverview caseDetails={caseDetails} />
      
      {/* Clinical Details (e.g., Diagnosis) still live in their own section */}
      <div className="specialization-tabs section-card">
        <h2>Clinical Details</h2>
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

      {/* --- AGENT ACTIONS SECTION (remains the same) --- */}
      <div className="actions-section section-card">
        <h2>Agent Actions</h2>
        <div className="agent-tabs-header">
            <button onClick={() => setActiveAgentTab('eligibility')} className={activeAgentTab === 'eligibility' ? 'active' : ''} disabled={isAgentRunning}>Eligibility Check</button>
            <button onClick={() => setActiveAgentTab('preauth')} className={activeAgentTab === 'preauth' ? 'active' : ''} disabled={isAgentRunning}>Pre-Authorization</button>
        </div>
        <div className="agent-tabs-content">
            {activeAgentTab === 'eligibility' && (
                <AgentWorkflow buttonText="Run Eligibility Agent" runAgentFunction={runEligibilityAgent} caseDetails={caseDetails} responseType="eligibility" isDisabled={isAgentRunning} onStateChange={setIsAgentRunning} />
            )}
            {activeAgentTab === 'preauth' && (
                <AgentWorkflow buttonText="Run Pre-Auth Agent" runAgentFunction={runPreAuthAgent} caseDetails={caseDetails} responseType="preauth" isDisabled={isAgentRunning} onStateChange={setIsAgentRunning} />
            )}
        </div>
      </div>
    </div>
  );
}

export default DetailPage;