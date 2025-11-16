import React from 'react';
import CaseCard from '../components/CaseCard';
import './Dashboard.css';

function Dashboard({ cases }) {
  return (
    <div className="dashboard">
      <div className="metrics-header">
        <h2>Case Overview</h2>
        <p>You have {cases.length} active cases.</p>
      </div>
      <div className="case-grid">
        {cases.map(caseInfo => (
          <CaseCard key={caseInfo.requestId} caseInfo={caseInfo} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;