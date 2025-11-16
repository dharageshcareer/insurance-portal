import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DetailPage.css';
import '../components/Loader.css'; // For the loading spinner

function DetailPage({ cases }) {
  const { requestId } = useParams();
  const [caseDetails, setCaseDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnosis');

  const [isChecking, setIsChecking] = useState(false);
  const [timelineSteps, setTimelineSteps] = useState([]);
  const [finalResponse, setFinalResponse] = useState(null);

  useEffect(() => {
    const details = cases.find(c => c.requestId === requestId);
    setCaseDetails(details);
  }, [requestId, cases]);

  const runEligibilityCheck = async () => {
    setIsChecking(true);
    setFinalResponse(null);
    setTimelineSteps([]);

    // Simulate API call and intermediate steps
    setTimelineSteps(prev => [...prev, ">> Agent is calling tool 'get_member_and_policy_data'..."]);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setTimelineSteps(prev => [...prev, ">> Agent received response from tool 'get_member_and_policy_data'."]);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Final response
    const response = {
      "eligibility_status": "eligible",
      "pre_auth_required": false,
      "coverage_details": {
        "balance_coverage": 500000,
        "room_rent_limit": {
          "private_room_per_day": 5000,
          "icu_per_day": 10000,
          "notes": "Covers a standard private room. Luxury suites are excluded."
        },
        "notes": "Balance coverage indicates the total sum insured for the policy year."
      },
      "patient_financial_responsibility": { "copay": 20 },
      "adjudication_rationale": "Adjudication complete. 1. Member Status: Verified as 'Active'. 2. Waiting Period: The 30-day waiting period is met. 3. CPT Code Coverage: CPT '99213' is a covered OPD service. 4. Medical Necessity: ICD code 'M17.11' is allowed for this service, confirming medical necessity. 5. Pre-authorization: Policy rules confirm pre-auth is not required. 6. Financials: A $20 OPD copay is applicable for this service. The service is deemed eligible."
    };
    
    setFinalResponse(response);
    setIsChecking(false);
  };

  if (!caseDetails) {
    return <div className="loading">Loading case details...</div>;
  }

  const { clinicalDetails } = caseDetails;

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">&larr; Back to Dashboard</Link>
      
      {/* Patient Overview */}
      <div className="patient-overview section-card">
        <h2>Patient Overview</h2>
        <div className="overview-grid">
          <p><strong>Name:</strong> {caseDetails.patientName}</p>
          <p><strong>Member ID:</strong> {caseDetails.memberId}</p>
          <p><strong>Date of Birth:</strong> {caseDetails.dob}</p>
          <p><strong>Policy ID:</strong> {caseDetails.policyId}</p>
        </div>
      </div>

      {/* Specialization Tabs */}
      <div className="specialization-tabs section-card">
        <div className="tab-headers">
          <button onClick={() => setActiveTab('diagnosis')} className={activeTab === 'diagnosis' ? 'active' : ''}>Diagnosis</button>
          <button onClick={() => setActiveTab('summary')} className={activeTab === 'summary' ? 'active' : ''}>Clinical Summary</button>
          <button onClick={() => setActiveTab('documents')} className={activeTab === 'documents' ? 'active' : ''}>Documents Submitted</button>
        </div>
        <div className="tab-content">
          {activeTab === 'diagnosis' && <div><h4>Primary Diagnosis</h4><p>{clinicalDetails.diagnosis}</p><h4>Symptoms</h4><p>{clinicalDetails.symptoms}</p></div>}
          {activeTab === 'summary' && <ul>{clinicalDetails.clinicalHistory.map((item, index) => <li key={index}>{item}</li>)}</ul>}
          {activeTab === 'documents' && <ul>{clinicalDetails.documents.map((doc, index) => <li key={index}>{doc.name} <span>({doc.size})</span></li>)}</ul>}
        </div>
      </div>

      {/* Actions & Results */}
      <div className="actions-section section-card">
        <h2>Actions</h2>
        <div className="action-buttons">
          <button onClick={runEligibilityCheck} disabled={isChecking}>Run Eligibility Check</button>
          <button disabled={isChecking}>Run Pre-Auth Check</button>
        </div>
        
        {isChecking && (
          <div className="timeline-view">
            <h4>Processing Steps:</h4>
            {timelineSteps.map((step, index) => <p key={index} className="timeline-step">{step}</p>)}
            <div className="loader"></div>
          </div>
        )}

        {finalResponse && (
          <div className="results-view">
            <h4>Final Decision</h4>
            <pre>{JSON.stringify(finalResponse, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailPage;