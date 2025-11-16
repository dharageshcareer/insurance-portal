import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { runEligibilityAgent, runPreAuthAgent } from '../services/apiService';
import AgentWorkflow from '../components/AgentWorkflow'; // Import the new component
import './DetailPage.css';

function DetailPage({ cases }) {
  const { requestId } = useParams();
  const [caseDetails, setCaseDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnosis');
  
  // A single state to track if ANY agent is running to disable all buttons
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
      
      {/* Patient Overview and Tabs sections remain unchanged */}
      <div className="patient-overview section-card">
        <h2>Patient Overview</h2>
        <div className="overview-grid">
          <p><strong>Name:</strong> {caseDetails.patientName}</p>
          <p><strong>Member ID:</strong> {caseDetails.memberId}</p>
          <p><strong>Date of Birth:</strong> {caseDetails.dob}</p>
          <p><strong>Policy ID:</strong> {caseDetails.policyId}</p>
        </div>
      </div>
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
        
        {/* Use the new reusable component for the Eligibility Check */}
        <AgentWorkflow
          title="Step 1: Eligibility Check"
          buttonText="Run Eligibility Agent"
          runAgentFunction={runEligibilityAgent}
          caseDetails={caseDetails}
          responseType="eligibility"
          isDisabled={isAgentRunning}
          onStateChange={setIsAgentRunning}
        />
        
        {/* Use the new reusable component for the Pre-Authorization Check */}
        <AgentWorkflow
          title="Step 2: Pre-Authorization"
          buttonText="Run Pre-Auth Agent"
          runAgentFunction={runPreAuthAgent}
          caseDetails={caseDetails}
          responseType="preauth"
          isDisabled={isAgentRunning}
          onStateChange={setIsAgentRunning}
        />
      </div>
    </div>
  );
}

export default DetailPage;