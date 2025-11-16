import React from 'react';
import { Link } from 'react-router-dom';
import './CaseCard.css';

const getStatusClass = (status) => {
  // ... (same as before)
  switch (status.toLowerCase()) {
    case 'eligibility check': return 'status-eligibility';
    case 'pre-auth': return 'status-preauth';
    case 'approved': return 'status-approved';
    default: return '';
  }
};

function CaseCard({ caseInfo }) {
  return (
    <Link to={`/case/${caseInfo.requestId}`} className="case-card-link">
      <div className="case-card">
        <div className="card-header">
          <h3 className="request-id">{caseInfo.requestId}</h3>
          <span className={`status-badge ${getStatusClass(caseInfo.status)}`}>
            {caseInfo.status}
          </span>
        </div>
        <div className="card-body">
          <p><strong>Patient:</strong> {caseInfo.patientName}</p>
          <p><strong>Hospital:</strong> {caseInfo.serviceDetails.hospitalName}</p>
        </div>
        <div className="card-footer">
          <span><strong>Service Date:</strong> {caseInfo.serviceDetails.dateOfService}</span>
          <span><strong>CPT:</strong> {caseInfo.serviceDetails.cptCode}</span>
        </div>
      </div>
    </Link>
  );
}

export default CaseCard;