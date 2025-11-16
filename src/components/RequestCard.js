import React from 'react';
import './ResultsCard.css';

const StatusPill = ({ text, type }) => (
  <span className={`status-pill ${type}`}>
    {text}
  </span>
);

const EligibilityView = ({ response }) => {
  const statusClass = response.eligibility_status === 'eligible' ? 'status-eligible' : 'status-denied';
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
          <strong>Service Coverage Details</strong>
          <div className="details-table">
            <div><span>Description</span><span>{response.coverage_details?.description} (CPT: {response.coverage_details?.cpt_code})</span></div>
            <div><span>Covered</span><StatusPill text={response.coverage_details?.covered ? 'Yes' : 'No'} type={response.coverage_details?.covered ? 'covered' : 'not-covered'} /></div>
          </div>
        </div>
      )}
      {response.patient_financial_responsibility && (
         <div className="result-item full-width">
          <strong>Patient Financials</strong>
          <div className="details-table">
              <div><span>Copay Due</span><span>${response.patient_financial_responsibility?.copay_due?.toLocaleString() ?? 'N/A'}</span></div>
              <div><span>Coinsurance</span><span>{response.patient_financial_responsibility?.coinsurance ?? 'N/A'}</span></div>
              <div><span>Deductible Remaining</span><span>${response.patient_financial_responsibility?.deductible_remaining?.toLocaleString() ?? 'N/A'}</span></div>
              <div><span>Out of Pocket Max Remaining</span><span>${response.patient_financial_responsibility?.out_of_pocket_maximum_remaining?.toLocaleString() ?? 'N/A'}</span></div>
          </div>
        </div>
      )}
      <div className="result-item full-width rationale">
        <strong>Adjudication Rationale</strong>
        <p>{response.adjudication_rationale}</p>
      </div>
    </div>
  );
};

const PreAuthView = ({ response }) => {
  const decisionType = response.decision?.toLowerCase() || 'denied';
  return (
    <div className="results-grid-single">
      <div className="result-item">
        <strong>Decision</strong>
        <StatusPill text={response.decision} type={decisionType === 'approved' ? 'covered' : 'not-covered'} />
      </div>
      <div className="result-item rationale">
        <strong>Reasoning</strong>
        <p>{response.reasoning}</p>
      </div>
    </div>
  );
};

const ResultsCard = ({ response, title, type = 'eligibility' }) => {
  if (!response) return null;
  
  return (
    <div className="results-card">
      <h4>{title}</h4>
      {type === 'eligibility' && <EligibilityView response={response} />}
      {type === 'preauth' && <PreAuthView response={response} />}
    </div>
  );
};

export default ResultsCard;