import React from 'react';
import { Link } from 'react-router-dom';
import './CaseCard.css';

// Helper functions are now "defensive" - they provide a fallback if data is missing.
const getStatusClass = (status) => (status || '').toLowerCase().replace(' ', '-');
const getPriorityClass = (priority) => (priority || 'routine').toLowerCase(); // Default to 'routine' if missing

// Simple emoji icons.
const icons = {
  patient: '👤',
  insurance: '📄',
  time: '🕘',
  documents: '📋',
  agents: '📈'
};

const CaseCard = ({ caseInfo }) => {
  // Provide default empty objects to prevent crashes if a section is missing
  const { 
    requestId, 
    procedure, 
    status, 
    priority, 
    confidence, 
    patient = {}, 
    insurance = {}, 
    metrics = {} 
  } = caseInfo;

  return (
    <Link to={`/case/${requestId}`} className="case-card-link">
      <div className={`case-card ${getPriorityClass(priority)}`}>
        <div className="card-main-content">
          {/* --- HEADER --- */}
          <div className="card-header">
            <span className="auth-id">{requestId}</span>
            <div className="tags">
              {status && <span className={`tag status ${getStatusClass(status)}`}>{status}</span>}
              {priority && <span className={`tag priority ${getPriorityClass(priority)}`}>{priority}</span>}
            </div>
          </div>

          {/* --- PROCEDURE --- */}
          <p className="procedure">{procedure}</p>

          {/* --- PATIENT & INSURANCE INFO --- */}
          <div className="info-section">
            <div className="info-line">
              <span className="icon">{icons.patient}</span>
              <span className="patient-name">{patient.name || 'N/A'}</span>
              <span className="details"> • {patient.age}y • MRN: {patient.mrn}</span>
            </div>
            <div className="info-line">
              <span className="icon">{icons.insurance}</span>
              <span>{insurance.provider || 'N/A'}</span>
            </div>
          </div>
          
          <div className="divider" />

          {/* --- FOOTER METRICS --- */}
          <div className="metrics-footer">
            <div className="metric-item">
              <span className="metric-label">Processing Time</span>
              <div className="metric-value">
                <span className="icon-small">{icons.time}</span> {metrics.processingTime || 'N/A'}
              </div>
            </div>
            <div className="metric-item">
              <span className="metric-label">Documents</span>
              <div className="metric-value">
                <span className="icon-small">{icons.documents}</span> {metrics.documents || 0}
              </div>
            </div>
            <div className="metric-item">
              <span className="metric-label">Agents</span>
              <div className="metric-value">
                <span className="icon-small">{icons.agents}</span> {metrics.agents || 0}
              </div>
            </div>
          </div>
        </div>

        {/* --- CONFIDENCE SCORE --- */}
        <div className="card-confidence-score">
          <span className="confidence-percent">{confidence || 0}%</span>
          <span className="confidence-label">Confidence</span>
        </div>
      </div>
    </Link>
  );
};

export default CaseCard;