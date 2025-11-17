import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DetailPage from './pages/DetailPage';
import './App.css';

// Mock data that both pages can access. In a real app, this would come from a state manager or API.
export const caseData = [
  {
    requestId: 'AUTH-2024-001',
    procedure: 'Total Knee Arthroplasty (TKA)',
    status: 'Approved',
    priority: 'Routine', // <--- THIS FIELD WAS MISSING
    confidence: 94,
    submitted: {
        date: '1/15/2024',
        time: '3:00:00 PM',
    },
    metrics: {
        processingTime: '9m 15s',
        documents: 5, // This was missing in the previous data for CaseCard
        agents: 7,
    },
    patient: {
      name: 'Margaret Chen',
      age: 67,
      mrn: 'MRN-847392',
    },
    insurance: {
      provider: 'Blue Cross Blue Shield PPO',
      planId: 'BCBS-TX-8473921',
    },
    // Keep the detailed data needed for the detail page
    memberId: 'M001',
    dob: '1957-05-20',
    policyId: 'POL98765',
    serviceDetails: { date_of_service: "2025-04-10", cpt_code: "27447", icd_codes: ["M17.11"], provider_npi: "1427683920", place_of_service: "OPD" },
    clinicalDetails: { symptoms: "Chronic knee pain", diagnosis: 'Primary osteoarthritis of the right knee.', clinicalHistory: ["Knee osteoarthritis diagnosed in 2022", "Failed conservative treatments"], documents: [ { name: 'doctor_notes_M001.pdf', size: '2.1MB' }, { name: 'xray_report_M001.pdf', size: '5.4MB' } ] },
  },
  {
    requestId: 'AUTH-2024-002',
    procedure: 'Cardiac Catheterization with Possible PCI',
    status: 'Pending Info',
    priority: 'Urgent', // <--- THIS FIELD WAS MISSING
    confidence: 91,
    submitted: {
        date: '1/16/2024',
        time: '11:30:00 AM',
    },
    metrics: {
        processingTime: '4m 10s',
        documents: 3,
        agents: 4,
    },
    patient: {
      name: 'Robert Williams',
      age: 58,
      mrn: 'MRN-923847',
    },
    insurance: {
      provider: 'Aetna HMO',
      planId: 'AETNA-NY-923847',
    },
    // Keep the detailed data
    memberId: 'M002',
    dob: '1966-09-15',
    policyId: 'POL12345',
    serviceDetails: { date_of_service: "2025-04-12", cpt_code: "99203", icd_codes: ["I25.10"], provider_npi: "1427683921", place_of_service: "Hospital" },
    clinicalDetails: { symptoms: "Chest pain and shortness of breath", diagnosis: 'Atherosclerotic heart disease', clinicalHistory: ["History of hypertension"], documents: [ { name: 'cardiologist_report_M002.pdf', size: '1.8MB' } ] },
  },
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
            <Route path="/" element={<Dashboard cases={caseData} />} />
            <Route path="/case/:requestId" element={<DetailPage cases={caseData} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;