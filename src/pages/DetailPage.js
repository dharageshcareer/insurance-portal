import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRequestDetails, runEligibilityAgent, runPreAuthAgent } from '../services/apiService';
import AgentWorkflow from '../components/AgentWorkflow';
import CaseOverview from '../components/CaseOverview';
import './DetailPage.css';

// A small, reusable component to display a block of details
const DetailBlock = ({ title, data }) => {
    if (!data) return null;
    return (
        <div className="detail-block">
            <h4>{title}</h4>
            <div className="detail-grid">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="detail-item">
                        <span className="detail-key">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="detail-value">{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

function DetailPage() {
    const { requestId } = useParams();
    const [caseDetails, setCaseDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeDetailTab, setActiveDetailTab] = useState('patient');
    const [activeAgentTab, setActiveAgentTab] = useState('eligibility');
    const [isAgentRunning, setIsAgentRunning] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const data = await getRequestDetails(requestId);
                setCaseDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [requestId]);

    if (isLoading) {
        return <div className="loading">Loading Case Details...</div>;
    }
    if (error) {
        return <div className="detail-page"><p className="error-message">{error}</p></div>;
    }
    // We need to transform the fetched data to fit the CaseOverview component's expected props
    const overviewData = {
        requestId: caseDetails.requestId,
        procedure: caseDetails.serviceDetails.cptCode, // Example mapping
        status: 'In Progress', // This would come from another field or state
        confidence: 0,
        patient: { name: `${caseDetails.patient.firstName} ${caseDetails.patient.lastName}`, age: new Date().getFullYear() - new Date(caseDetails.patient.dateOfBirth).getFullYear(), mrn: caseDetails.insurance.memberId },
        insurance: { provider: caseDetails.insurance.payerName, planId: caseDetails.insurance.policyNumber },
        submitted: { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() },
        metrics: { processingTime: 'N/A', agents: 0 },
    };

    return (
        <div className="detail-page">
            <Link to="/" className="back-link">&larr; Back to Dashboard</Link>
            
            <CaseOverview caseDetails={overviewData} />
            
            <div className="specialization-tabs section-card">
                <h2>Request Details</h2>
                <div className="tab-headers">
                    <button onClick={() => setActiveDetailTab('patient')} className={activeDetailTab === 'patient' ? 'active' : ''}>Patient</button>
                    <button onClick={() => setActiveDetailTab('insurance')} className={activeDetailTab === 'insurance' ? 'active' : ''}>Insurance</button>
                    <button onClick={() => setActiveDetailTab('provider')} className={activeDetailTab === 'provider' ? 'active' : ''}>Provider</button>
                    <button onClick={() => setActiveDetailTab('service')} className={activeDetailTab === 'service' ? 'active' : ''}>Service</button>
                    <button onClick={() => setActiveDetailTab('clinical')} className={activeDetailTab === 'clinical' ? 'active' : ''}>Clinical</button>
                </div>
                <div className="tab-content">
                    {activeDetailTab === 'patient' && <DetailBlock title="Patient Information" data={caseDetails.patient} />}
                    {activeDetailTab === 'insurance' && <DetailBlock title="Insurance Information" data={caseDetails.insurance} />}
                    {activeDetailTab === 'provider' && <DetailBlock title="Provider Information" data={caseDetails.provider} />}
                    {activeDetailTab === 'service' && <DetailBlock title="Service Details" data={caseDetails.serviceDetails} />}
                    {activeDetailTab === 'clinical' && (
                        <>
                            <DetailBlock title="Vitals" data={caseDetails.clinical.vitals} />
                            <DetailBlock title="Medical History" data={caseDetails.clinical.medicalHistory} />
                            <DetailBlock title="Clinical Notes" data={{ notes: caseDetails.clinical.clinicalNotes }} />
                        </>
                    )}
                </div>
            </div>

            <div className="actions-section section-card">
                <h2>Agent Actions</h2>
                <div className="agent-tabs-header">
                    <button onClick={() => setActiveAgentTab('eligibility')} className={activeAgentTab === 'eligibility' ? 'active' : ''} disabled={isAgentRunning}>Eligibility Check</button>
                    <button onClick={() => setActiveAgentTab('preauth')} className={activeAgentTab === 'preauth' ? 'active' : ''} disabled={isAgentRunning}>Pre-Authorization</button>
                </div>
                <div className="agent-tabs-content">
                    {activeAgentTab === 'eligibility' && <AgentWorkflow buttonText="Run Eligibility Agent" runAgentFunction={runEligibilityAgent} caseDetails={caseDetails} responseType="eligibility" isDisabled={isAgentRunning} onStateChange={setIsAgentRunning} />}
                    {activeAgentTab === 'preauth' && <AgentWorkflow buttonText="Run Pre-Auth Agent" runAgentFunction={runPreAuthAgent} caseDetails={caseDetails} responseType="preauth" isDisabled={isAgentRunning} onStateChange={setIsAgentRunning} />}
                </div>
            </div>
        </div>
    );
}

export default DetailPage;