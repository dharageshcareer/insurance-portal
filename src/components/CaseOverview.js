import React from 'react';
import './CaseOverview.css';

// Simple emoji icons. For a real app, use an icon library like react-icons.
const icons = {
  patient: '👤',
  insurance: '🏢', // Building icon for provider
  submitted: '📅',
  processing: '📈',
};

// Helper to get the right CSS class for the status tag
const getStatusClass = (status) => status.toLowerCase().replace(' ', '-');

const InfoCard = ({ title, icon, children }) => (
  <div className="info-card">
    <div className="info-card-header">
      {icon} {title}
    </div>
    <div className="info-card-body">
      {children}
    </div>
  </div>
);

const CaseOverview = ({ caseDetails }) => {
  if (!caseDetails) return null;

  const { requestId, procedure, status, confidence, patient, insurance, submitted, metrics } = caseDetails;

  return (
    <div className="case-overview-container section-card">
      {/* --- TOP HEADER --- */}
      <div className="overview-header">
        <div className="header-left">
          <span className="auth-id">{requestId}</span>
          <span className={`status-tag ${getStatusClass(status)}`}>{status}</span>
        </div>
        <div className="header-right">
          <span className="confidence-score">{confidence}%</span>
          <span className="confidence-label">AI Confidence Score</span>
        </div>
      </div>
      <p className="procedure-title">{procedure}</p>

      {/* --- INFO CARDS GRID --- */}
      <div className="info-cards-grid">
        <InfoCard title="Patient" icon={icons.patient}>
          <div className="main-info">{patient.name}</div>
          <div className="sub-info">{patient.age}y • {patient.mrn}</div>
        </InfoCard>

        <InfoCard title="Insurance" icon={icons.insurance}>
          <div className="main-info">{insurance.provider}</div>
          <div className="sub-info">{insurance.planId}</div>
        </InfoCard>

        <InfoCard title="Submitted" icon={icons.submitted}>
          <div className="main-info">{submitted.date}</div>
          <div className="sub-info">{submitted.time}</div>
        </InfoCard>

      </div>
    </div>
  );
};

export default CaseOverview;