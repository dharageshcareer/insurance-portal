import React from 'react';
import './ResultsCard.css';

// A small helper component for displaying boolean values nicely
const StatusPill = ({ isCovered }) => (
  <span className={`status-pill ${isCovered ? 'covered' : 'not-covered'}`}>
    {isCovered ? 'Yes' : 'No'}
  </span>
);

const ResultsCard = ({ response, title }) => {
  if (!response) return null;

  const statusClass = response.eligibility_status === 'eligible' ? 'status-eligible' : 'status-denied';

  return (
    <div className="results-card">
      <h4>{title}</h4>
      <div className="results-grid">
        {/* --- MAIN STATUS --- */}
        <div className="result-item">
          <strong>Eligibility Status</strong>
          <span className={`result-status ${statusClass}`}>{response.eligibility_status}</span>
        </div>
        <div className="result-item">
          <strong>Pre-Auth Required</strong>
          <StatusPill isCovered={!response.pre_auth_required} />
        </div>
        
        {/* --- SERVICE COVERAGE DETAILS --- */}
        {response.coverage_details && (
          <div className="result-item full-width">
            <strong>Service Coverage Details</strong>
            <div className="details-table">
              <div><span>Description</span><span>{response.coverage_details.description} (CPT: {response.coverage_details.cpt_code})</span></div>
              <div><span>Category</span><span>{response.coverage_details.category}</span></div>
              <div><span>Covered</span><StatusPill isCovered={response.coverage_details.covered} /></div>
            </div>
          </div>
        )}

        {/* --- PATIENT FINANCIAL RESPONSIBILITY --- */}
        {response.patient_financial_responsibility && (
           <div className="result-item full-width">
            <strong>Patient Financials</strong>
            <div className="details-table">
                <div><span>Copay Due</span><span>${response.patient_financial_responsibility.copay_due.toLocaleString()}</span></div>
                <div><span>Coinsurance</span><span>{response.patient_financial_responsibility.coinsurance}</span></div>
                <div><span>Deductible Remaining</span><span>${response.patient_financial_responsibility.deductible_remaining.toLocaleString()}</span></div>
                <div><span>Out of Pocket Max Remaining</span><span>${response.patient_financial_responsibility.out_of_pocket_maximum_remaining.toLocaleString()}</span></div>
            </div>
          </div>
        )}

        {/* --- RATIONALE --- */}
        <div className="result-item full-width rationale">
          <strong>Adjudication Rationale</strong>
          <p>{response.adjudication_rationale}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;