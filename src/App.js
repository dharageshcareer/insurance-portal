import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DetailPage from './pages/DetailPage';
import './App.css';

export const caseData = [
  {
    // High-level data for dashboard/overview
    requestId: 'AUTH-2024-001',
    procedure: 'Total Knee Arthroplasty (TKA)',
    status: 'In Progress',
    priority: 'Routine',
    confidence: 0,
    submitted: { date: '1/15/2024', time: '3:00:00 PM' },
    metrics: { processingTime: 'N/A', documents: 2, agents: 0 },

    // Detailed data for the new Eligibility payload
    patient_payload: { "firstName": "Michael", "lastName": "Lee", "dateOfBirth": "1978-11-05", "gender": "M", "contactNumber": "+1-555-333-7777", "emailId": "michael.lee@example.com" },
    insurance_payload: { "payerName": "Blue Cross Bronze PPO", "memberId": "M003", "policyNumber": "POL555666777" },
    provider_payload: { "providerName": "Sunrise Hospital", "facilityNPI": "3344556677", "renderingPhysician": "Dr. Robert Kim", "physicianNPI": "8877665544" },
    serviceDetails_payload: { "dateOfService": "2025-06-15", "typeOfService": "Inpatient", "cptCode": "27447", "diagnosisCode": "M17.11" },
    clinical_payload: { "vitals": { "bloodPressure": "130/85", "heartRate": 82, "temperature": "99.0F", "respiratoryRate": 18, "spo2": "96%" }, "diagnosisList": [ { "icdCode": "M17.11", "description": "Unilateral primary osteoarthritis", "primary": true } ], "clinicalNotes": "Severe knee pain requiring surgery.", "medicalHistory": { "pastConditions": ["Hypertension"], "currentMedications": ["Lisinopril 10mg"] } },
    
    // Data for the Pre-Auth payload and other UI parts
    memberId: 'M001', // Corresponds to the pre-auth payload member_id
    serviceDetails: { cpt_code: "27447" },
    clinicalDetails: { 
      symptoms: "Severe knee pain",
      diagnosis: 'Unilateral primary osteoarthritis',
      clinicalHistory: ["Hypertension"],
      // --- THIS IS THE UPDATED DOCUMENT STRUCTURE ---
      documents: [ 
        { "documentType": "Clinical Notes", "fileName": "doctor_notes_M001.pdf" }, 
        { "documentType": "Imaging Report", "fileName": "xray_report_M001.pdf" } 
      ] 
    },

    // Data for the Detail Page Overview
    patient: { name: 'Michael Lee', age: 47, mrn: 'MRN-847392' },
    insurance: { provider: 'Blue Cross Bronze PPO', planId: 'BCBS-TX-8473921' },
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