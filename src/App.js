import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DetailPage from './pages/DetailPage';
import './App.css';

// This data is now ONLY for the Dashboard cards. All detail is fetched on the DetailPage.
export const dashboardCases = [
  {
    requestId: 'AUTH-2024-001',
    procedure: 'Total Knee Arthroplasty (TKA)',
    status: 'Approved',
    priority: 'Routine',
    confidence: 94,
    patient: { name: 'John Doe', age: 67, mrn: 'MRN-847392' },
    insurance: { provider: 'Aetna PPO Gold' },
    metrics: { processingTime: '9m 15s', documents: 2, agents: 7 },
  },
  {
    requestId: 'AUTH-2024-002',
    procedure: 'Cardiac Catheterization',
    status: 'Pending Info',
    priority: 'Urgent',
    confidence: 91,
    patient: { name: 'Sarah Johnson', age: 58, mrn: 'MRN-923847' },
    insurance: { provider: 'Kaiser HMO Silver' },
    metrics: { processingTime: '4m 10s', documents: 2, agents: 4 },
  },
  {
    requestId: 'AUTH-2024-003',
    procedure: 'Total Knee Arthroplasty (TKA)',
    status: 'In Progress',
    priority: 'Routine',
    confidence: 0,
    patient: { name: 'Michael Lee', age: 47, mrn: 'MRN-847392' },
    insurance: { provider: 'Blue Cross Bronze PPO' },
    metrics: { processingTime: 'N/A', documents: 2, agents: 0 },
  }
];

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>Insurance Prior Authorization Portal</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard cases={dashboardCases} />} />
            {/* The DetailPage route no longer needs props */}
            <Route path="/case/:requestId" element={<DetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;