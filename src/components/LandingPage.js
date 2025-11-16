import React from 'react';
import RequestCard from './RequestCard';
import './LandingPage.css';

// Mock data for the insurance requests
const requests = [
  {
    requestId: 'REQ7512',
    patientName: 'John Doe',
    requestDate: '2025-11-15',
    documents: 5,
    status: 'Eligibility Check',
    memberId: 'M001',
    serviceDetails: {
      dateOfService: '2025-11-20',
      cptCode: '99213',
      icdCodes: ['M17.11'],
      hospitalName: 'Unity General Hospital'
    },
    clinicalDetails: {
      symptoms: 'Chronic knee pain',
      clinicalHistory: ['Knee osteoarthritis diagnosed in 2022']
    }
  },
  {
    requestId: 'REQ7513',
    patientName: 'Jane Smith',
    requestDate: '2025-11-14',
    documents: 3,
    status: 'Pre-auth',
    memberId: 'M002',
    serviceDetails: {
      dateOfService: '2025-11-18',
      cptCode: '88305',
      icdCodes: ['D22.5', 'Z01.818'],
      hospitalName: 'City Central Clinic'
    },
    clinicalDetails: {
      symptoms: 'Suspicious skin lesion on the arm',
      clinicalHistory: ['Previous history of atypical moles']
    }
  },
   {
    requestId: 'REQ7514',
    patientName: 'Peter Jones',
    requestDate: '2025-11-13',
    documents: 8,
    status: 'Approved',
    memberId: 'M003',
    serviceDetails: {
      dateOfService: '2025-11-22',
      cptCode: '27447',
      icdCodes: ['M17.12'],
      hospitalName: 'Metropolitan Surgical Center'
    },
    clinicalDetails: {
      symptoms: 'Severe left knee pain, limited mobility',
      clinicalHistory: ['Failed conservative treatments for osteoarthritis']
    }
  }
];


function LandingPage() {
  return (
    <div className="landing-page">
      <div className="request-grid">
        {requests.map(request => (
          <RequestCard key={request.requestId} request={request} />
        ))}
      </div>
    </div>
  );
}

export default LandingPage;