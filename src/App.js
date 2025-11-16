import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DetailPage from './pages/DetailPage';
import './App.css';

// Mock data that both pages can access. In a real app, this would come from a state manager or API.
export const caseData = [
  {
    requestId: 'REQ7512',
    patientName: 'John Doe',
    requestDate: '2025-11-15',
    documents: 5,
    status: 'Eligibility Check',
    memberId: 'M001', // Corresponds to member_id
    dob: '1985-05-20',
    policyId: 'POL98765',
    // --- THIS IS THE CRITICAL SECTION TO FIX ---
    serviceDetails: {
      date_of_service: "2025-04-10",
      cpt_code: "99213",
      icd_codes: ["M17.11"],
      provider_npi: "1427683920", // Added this required field
      place_of_service: "OPD"       // Added this required field
    },
    clinicalDetails: {
      symptoms: "Chronic knee pain", // Corresponds to symptoms
      diagnosis: 'Primary osteoarthritis of the right knee.',
      clinicalHistory: ["Knee osteoarthritis diagnosed in 2022"], // Corresponds to clinical_history
      documents: [
        { name: 'doctor_notes_M001.pdf', size: '2.1MB' }
      ]
    },
  },
  {
    requestId: 'REQ7513',
    patientName: 'Jane Smith',
    requestDate: '2025-11-14',
    documents: 3,
    status: 'Pre-auth',
    memberId: 'M002',
    dob: '1992-09-15',
    policyId: 'POL12345',
    serviceDetails: {
      dateOfService: '2025-11-18',
      cptCode: '88305',
      icdCodes: ['D22.5', 'Z01.818'],
      hospitalName: 'City Central Clinic'
    },
    clinicalDetails: {
      symptoms: 'Atypical mole on the left arm, recent changes in color and size.',
      diagnosis: 'Atypical nevus of skin of left upper limb.',
      clinicalHistory: [
        'Patient has a family history of melanoma.',
        'The lesion has been present for several years but has grown in the last 3 months.',
      ],
      documents: [
        { name: 'Dermatology Referral.pdf', size: '1.2MB' },
        { name: 'Clinical Photo Lesion.jpg', size: '3.5MB' },
      ]
    }
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
            <Route path="/" element={<Dashboard cases={caseData} />} />
            <Route path="/case/:requestId" element={<DetailPage cases={caseData} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;