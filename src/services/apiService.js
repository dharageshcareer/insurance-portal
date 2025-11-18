// --- Configuration from .env file ---
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const USER_ID = process.env.REACT_APP_USER_ID;
const ELIGIBILITY_AGENT_NAME = process.env.REACT_APP_ELIGIBILITY_AGENT_NAME;
const PREAUTH_AGENT_NAME = process.env.REACT_APP_PREAUTH_AGENT_NAME;
const CHATBOT_AGENT_NAME = process.env.REACT_APP_CHATBOT_AGENT_NAME;

// --- NEW: Mocked Backend Data ---
// In a real app, this data would be in a database.
const MOCK_DB_DATA = [
    // I have added a requestId to your data to make lookups possible
    { "requestId": "AUTH-2024-001", "patient": { "firstName": "John", "lastName": "Doe", "dateOfBirth": "1985-03-12", "gender": "M", "contactNumber": "+1-555-123-4567", "emailId": "john.doe@example.com" }, "insurance": { "payerName": "Aetna PPO Gold", "memberId": "M001", "policyNumber": "POL987654321" }, "provider": { "providerName": "CityCare Hospital", "facilityNPI": "1234567890", "renderingPhysician": "Dr. Mark Wilson", "physicianNPI": "1098765432" }, "serviceDetails": { "dateOfService": "2025-11-20", "typeOfService": "Inpatient", "cptCode": "27447", "diagnosisCode": "M17.11" }, "clinical": { "vitals": { "bloodPressure": "128/82", "heartRate": 88, "temperature": "98.6F", "respiratoryRate": 18, "spo2": "97%" }, "diagnosisList": [ { "icdCode": "M17.11", "description": "Unilateral primary osteoarthritis", "primary": true } ], "clinicalNotes": "Patient complains of severe knee pain.", "medicalHistory": { "pastConditions": ["Hypertension"], "currentMedications": ["Amlodipine 5mg"] } } },
    { "requestId": "AUTH-2024-002", "patient": { "firstName": "Sarah", "lastName": "Johnson", "dateOfBirth": "1990-07-22", "gender": "F", "contactNumber": "+1-555-987-6543", "emailId": "sarah.johnson@example.com" }, "insurance": { "payerName": "Kaiser HMO Silver", "memberId": "M002", "policyNumber": "POL123456789" }, "provider": { "providerName": "Green Valley Clinic", "facilityNPI": "2233445566", "renderingPhysician": "Dr. Emily Carter", "physicianNPI": "9988776655" }, "serviceDetails": { "dateOfService": "2025-03-01", "typeOfService": "Outpatient", "cptCode": "99213", "diagnosisCode": "M17.11" }, "clinical": { "vitals": { "bloodPressure": "120/80", "heartRate": 76, "temperature": "98.2F", "respiratoryRate": 16, "spo2": "98%" }, "diagnosisList": [ { "icdCode": "M17.11", "description": "Unilateral primary osteoarthritis", "primary": true } ], "clinicalNotes": "Mild knee pain reported.", "medicalHistory": { "pastConditions": ["Diabetes"], "currentMedications": ["Metformin 500mg"] } } },
    { "requestId": "AUTH-2024-003", "patient": { "firstName": "Michael", "lastName": "Lee", "dateOfBirth": "1978-11-05", "gender": "M", "contactNumber": "+1-555-333-7777", "emailId": "michael.lee@example.com" }, "insurance": { "payerName": "Blue Cross Bronze PPO", "memberId": "M003", "policyNumber": "POL555666777" }, "provider": { "providerName": "Sunrise Hospital", "facilityNPI": "3344556677", "renderingPhysician": "Dr. Robert Kim", "physicianNPI": "8877665544" }, "serviceDetails": { "dateOfService": "2025-06-15", "typeOfService": "Inpatient", "cptCode": "27447", "diagnosisCode": "M17.11" }, "clinical": { "vitals": { "bloodPressure": "130/85", "heartRate": 82, "temperature": "99.0F", "respiratoryRate": 18, "spo2": "96%" }, "diagnosisList": [ { "icdCode": "M17.11", "description": "Unilateral primary osteoarthritis", "primary": true } ], "clinicalNotes": "Severe knee pain requiring surgery.", "medicalHistory": { "pastConditions": ["Hypertension"], "currentMedications": ["Lisinopril 10mg"] } } }
];

/**
 * NEW: Fetches the complete details for a single request.
 * Currently mocked, but can be converted to a real fetch call later.
 * @param {string} requestId - The ID of the request to fetch.
 */
export const getRequestDetails = async (requestId) => {
    console.log(`Fetching details for request ID: ${requestId}`);
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const requestDetails = MOCK_DB_DATA.find(req => req.requestId === requestId);

    if (requestDetails) {
        return requestDetails;
    } else {
        throw new Error(`Request with ID "${requestId}" not found.`);
    }
};

// --- The rest of the file is updated to use the new data structure ---

const parseAgentEvent = (eventData) => { /* ... no change ... */ };
const runAgentWorkflow = async (agentName, requestPayload, onEvent, onComplete, onError) => { /* ... no change ... */ };

/**
 * EXPORTED: Runs the Eligibility agent workflow.
 * THIS FUNCTION IS NOW UPDATED TO SEND THE NEW PAYLOAD.
 */
export const runEligibilityAgent = async (caseDetails, onEvent, onComplete, onError) => {
    // Construct the payload directly from the fetched caseDetails
    const eligibilityRequest = {
      patient: caseDetails.patient,
      insurance: caseDetails.insurance,
      provider: caseDetails.provider,
      serviceDetails: caseDetails.serviceDetails,
      clinical: caseDetails.clinical
    };
    await runAgentWorkflow(ELIGIBILITY_AGENT_NAME, eligibilityRequest, onEvent, onComplete, onError);
};

/**
 * EXPORTED: Runs the Pre-Authorization agent workflow.
 * THIS FUNCTION IS NOW UPDATED TO SEND THE NEW PAYLOAD.
 */
export const runPreAuthAgent = async (caseDetails, onEvent, onComplete, onError) => {
    // Construct the payload directly from the fetched caseDetails
    const preAuthRequest = {
        member_id: caseDetails.insurance.memberId,
        cpt_code: caseDetails.serviceDetails.cptCode,
        // The documents payload is now a bit more complex, we simulate it here
        documents: [
            { "documentType": "Clinical Notes", "fileName": `doctor_notes_${caseDetails.insurance.memberId}.pdf` },
            { "documentType": "Imaging Report", "fileName": `xray_report_${caseDetails.insurance.memberId}.pdf` }
        ]
    };
    await runAgentWorkflow(PREAUTH_AGENT_NAME, preAuthRequest, onEvent, onComplete, onError);
};


// --- VVVV ADD THIS ENTIRE NEW CHAT SECTION TO THE END OF THE FILE VVVV ---

/**
 * Parses events from the chatbot agent stream.
 * It's simpler as it only looks for the final text response.
 * @param {object} eventData The raw event data from the stream.
 * @returns {object|null} A standardized event object for the UI.
 */
const parseChatEvent = (eventData) => {
    const part = eventData?.content?.parts?.[0];
    if (part?.text) {
        return { type: 'text', message: part.text };
    }
    return null;
};

/**
 * Creates a new chat session with the chatbot agent.
 * @returns {string|null} The new session ID, or null on failure.
 */
export const createChatSession = async () => {
    const sessionId = `session-chat-${USER_ID}-${Date.now()}`;
    const sessionUrl = `${BASE_URL}/apps/${CHATBOT_AGENT_NAME}/users/${USER_ID}/sessions/${sessionId}`;
    try {
        const response = await fetch(sessionUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        if (!response.ok) throw new Error(`Failed to create chat session. Status: ${response.status}`);
        return sessionId;
    } catch (error) {
        console.error(error);
        return null;
    }
};

/**
 * Sends a message to the chatbot and streams the response.
 * @param {string} message - The text message from the user.
 * @param {string} sessionId - The current active chat session ID.
 * @param {function} onChunk - A callback that receives each piece of the agent's text response.
 * @param {function} onComplete - A callback that fires when the stream is fully complete.
 * @param {function} onError - A callback for any fatal errors.
 */
export const sendChatMessage = async (message, sessionId, onChunk, onComplete, onError) => {
    const streamPayload = {
        appName: CHATBOT_AGENT_NAME,
        userId: USER_ID,
        sessionId: sessionId,
        newMessage: { role: "user", parts: [{ "text": message }] },
        // The "streaming: true" flag has been REMOVED.
    };

    try {
        const response = await fetch(`${BASE_URL}/run_sse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(streamPayload) });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                onComplete(); // The stream has finished
                break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const eventDataStr = line.substring('data: '.length);
                    if (!eventDataStr) continue;
                    try {
                        const eventData = JSON.parse(eventDataStr);
                        const chatEvent = parseChatEvent(eventData);
                        if (chatEvent) {
                            onChunk(chatEvent.message); // Send the text chunk to the UI
                        }
                    } catch (e) { /* Ignore non-JSON lines */ }
                }
            }
        }
    } catch (error) {
        onError(error.message);
    }
};