import React from 'react';
import './RequestCard.css';

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'eligibility check':
      return 'status-eligibility';
    case 'pre-auth':
      return 'status-preauth';
    case 'approved':
      return 'status-approved';
    case 'denied':
      return 'status-denied';
    default:
      return '';
  }
};

function RequestCard({ request }) {
  return (
    <div className="request-card">
      <div className="card-header">
        <h3 className="request-id">{request.requestId}</h3>
        <span className={`status-badge ${getStatusClass(request.status)}`}>
          {request.status}
        </span>
      </div>

      <div className="card-section">
        <h4>Patient & Provider</h4>
        <div className="info-grid">
          <p><strong>Patient:</strong> {request.patientName}</p>
          <p><strong>Member ID:</strong> {request.memberId}</p>
          <p className="full-width"><strong>Hospital:</strong> {request.serviceDetails.hospitalName}</p>
        </div>
      </div>

      <div className="card-section">
        <h4>Service Details</h4>
         <div className="info-grid">
            <p><strong>Service Date:</strong> {request.serviceDetails.dateOfService}</p>
            <p><strong>CPT Code:</strong> {request.serviceDetails.cptCode}</p>
            <p className="full-width"><strong>ICD Codes:</strong> {request.serviceDetails.icdCodes.join(', ')}</p>
        </div>
      </div>

       <div className="card-section">
        <h4>Clinical Summary</h4>
        <p><strong>Symptoms:</strong> {request.clinicalDetails.symptoms}</p>
      </div>

      <div className="card-footer">
        <span><strong>Request Date:</strong> {request.requestDate}</span>
        <span><strong>Docs:</strong> {request.documents}</span>
      </div>
    </div>
  );
}

export default RequestCard;