import React from 'react';
import './ResultsCard.css';

/**
 * A small helper component for displaying colored status pills.
 */
const StatusPill = ({ text, type }) => (
  <span className={`status-pill ${type}`}>
    {text}
  </span>
);

/**
 * A sub-component for rendering a single line in a rationale checklist.
 */
const RationaleItem = ({ item }) => {
  const isMet = (item.met || '').toLowerCase() === 'yes';
  return (
    <li className="rationale-item">
      <span className={`rationale-status ${isMet ? 'met' : 'not-met'}`}>
        {isMet ? '✓' : '✗'}
      </span>
      <span className="rationale-condition">{item.condition}</span>
    </li>
  );
};

/**
 * A dedicated view component for rendering the detailed Eligibility response.
 */
const EligibilityView = ({ response }) => {
  const statusClass = (response.eligibility_status || 'denied').replace('_', '-');
  return (
    <div className="results-grid">
      <div className="result-item">
        <strong>Eligibility Status</strong>
        <span className={`result-status ${statusClass}`}>{response.eligibility_status}</span>
      </div>
      <div className="result-item">
        <strong>Pre-Auth Required</strong>
        <StatusPill text={response.pre_auth_required ? 'Yes' : 'No'} type={response.pre_auth_required ? 'not-covered' : 'covered'}/>
      </div>
      
      {response.coverage_details && (
        <div className="result-item full-width">
          <strong>Coverage Details</strong>
          <div className="details-table">
            <div><span>Plan Name</span><span>{response.coverage_details.plan_name}</span></div>
            <div><span>Service Covered</span><StatusPill text={response.coverage_details.service_covered ? 'Yes' : 'No'} type={response.coverage_details.service_covered ? 'covered' : 'not-covered'} /></div>
            <div><span>ICD Covered</span><StatusPill text={response.coverage_details.icd_covered ? 'Yes' : 'No'} type={response.coverage_details.icd_covered ? 'covered' : 'not-covered'} /></div>
            <div><span>Room Rent Limit</span><span>${response.coverage_details.room_rent_limit?.toLocaleString() ?? 'N/A'}</span></div>
            <div><span>Deductible Remaining</span><span>${response.coverage_details.deductible_remaining?.toLocaleString() ?? 'N/A'}</span></div>
            <div><span>OOP Remaining</span><span>${response.coverage_details.oop_remaining?.toLocaleString() ?? 'N/A'}</span></div>
            <div><span>Sublimit Remaining</span><span>${response.coverage_details.sublimit_remaining?.toLocaleString() ?? 'N/A'}</span></div>
          </div>
        </div>
      )}
      
      {response.patient_financial_responsibility && (
         <div className="result-item full-width">
          <strong>Patient Financial Responsibility</strong>
          <div className="details-table">
              <div><span>Copay</span><span>${response.patient_financial_responsibility.copay?.toLocaleString() ?? 'N/A'}</span></div>
              <div><span>Coinsurance</span><span>{response.patient_financial_responsibility.coinsurance_percent}%</span></div>
              <div><span>Deductible To Be Paid</span><span>${response.patient_financial_responsibility.deductible_to_be_paid?.toLocaleString() ?? 'N/A'}</span></div>
              <div><span>Estimated Patient Pay</span><strong>${response.patient_financial_responsibility.estimated_patient_pay?.toLocaleString() ?? 'N/A'}</strong></div>
          </div>
        </div>
      )}
      
      {response.adjudication_rationale && Array.isArray(response.adjudication_rationale) && (
        <div className="result-item full-width rationale">
          <strong>Adjudication Rationale</strong>
          <ul className="rationale-list">
            {response.adjudication_rationale.map((item, index) => (
              <RationaleItem key={index} item={item} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * A dedicated view component for rendering the new detailed Pre-Authorization response.
 */
const PreAuthView = ({ response }) => {
  // Normalize decision text for styling (e.g., "Pre-Auth Approved" -> "approved")
  const decisionType = (response.decision || '').toLowerCase().includes('approved') ? 'approved' : 'denied';

  return (
    <div className="results-grid-single">
      <div className="result-item">
        <strong>Decision</strong>
        <StatusPill text={response.decision} type={decisionType === 'approved' ? 'covered' : 'not-covered'} />
      </div>
      
      {response.clinical_summary && (
        <div className="result-item rationale">
            <strong>Clinical Summary</strong>
            <p>{response.clinical_summary}</p>
        </div>
      )}

      {response.adjudication_rationale && Array.isArray(response.adjudication_rationale) && (
        <div className="result-item rationale">
          <strong>Adjudication Rationale</strong>
          <ul className="rationale-list">
            {response.adjudication_rationale.map((item, index) => (
              <RationaleItem key={index} item={item} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * The main component that acts as a "router" to select the correct view
 * based on the structure of the data it receives.
 */
const ResultsCard = ({ response, title, type }) => {
  if (!response) return null;
  
  const renderContent = () => {
    // Check for the unique structure of the Eligibility response
    if (type === 'eligibility' && response.eligibility_status) {
      return <EligibilityView response={response} />;
    }
    
    // Check for the unique structure of the new Pre-Auth response
    if (type === 'preauth' && response.decision && Array.isArray(response.adjudication_rationale)) {
      return <PreAuthView response={response} />;
    }
    
    // A robust fallback to display any unrecognized agent output.
    // This is very helpful for debugging new agent responses.
    return (
        <div className="result-item rationale">
            <strong>Unrecognized Agent Output</strong>
            <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
    );
  };

  return (
    <div className="results-card">
      <h4>{title}</h4>
      {renderContent()}
    </div>
  );
};

export default ResultsCard;