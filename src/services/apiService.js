// --- Configuration from .env file ---
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const USER_ID = process.env.REACT_APP_USER_ID;
const ELIGIBILITY_AGENT_NAME = process.env.REACT_APP_ELIGIBILITY_AGENT_NAME;
const PREAUTH_AGENT_NAME = process.env.REACT_APP_PREAUTH_AGENT_NAME;
const CHATBOT_AGENT_NAME = process.env.REACT_APP_CHATBOT_AGENT_NAME;

// --- 1. DATA LAYER: Mocked Backend Data ---
const MOCK_DB_DATA = [
    { "requestId": "AUTH-2024-001", "patient": { "firstName": "John", "lastName": "Doe", "dateOfBirth": "1985-03-12", "gender": "M", "contactNumber": "+1-555-123-4567", "emailId": "john.doe@example.com" }, "insurance": { "payerName": "Aetna PPO Gold", "memberId": "M001", "policyNumber": "POL987654321" }, "provider": { "providerName": "CityCare Hospital", "facilityNPI": "1234567890", "renderingPhysician": "Dr. Mark Wilson", "physicianNPI": "1098765432" }, "serviceDetails": { "dateOfService": "2025-11-20", "typeOfService": "Inpatient", "cptCode": "27447", "diagnosisCode": "M17.11" }, "clinical": { "vitals": { "bloodPressure": "128/82", "heartRate": 88, "temperature": "98.6F", "respiratoryRate": 18, "spo2": "97%" }, "diagnosisList": [ { "icdCode": "M17.11", "description": "Unilateral primary osteoarthritis", "primary": true } ], "clinicalNotes": "Patient complains of severe knee pain due to advanced osteoarthritis. Conservative treatments have failed.", "medicalHistory": { "pastConditions": ["Hypertension"], "currentMedications": ["Amlodipine 5mg"] } } },
    { "requestId": "AUTH-2024-002", "patient": { "firstName": "Sarah", "lastName": "Johnson", "dateOfBirth": "1990-07-22", "gender": "F", "contactNumber": "+1-555-987-6543", "emailId": "sarah.johnson@example.com" }, "insurance": { "payerName": "Kaiser HMO Silver", "memberId": "M002", "policyNumber": "POL123456789" }, "provider": { "providerName": "Green Valley Clinic", "facilityNPI": "2233445566", "renderingPhysician": "Dr. Emily Carter", "physicianNPI": "9988776655" }, "serviceDetails": { "dateOfService": "2025-03-01", "typeOfService": "Outpatient", "cptCode": "99213", "diagnosisCode": "M17.11" }, "clinical": { "vitals": { "bloodPressure": "120/80", "heartRate": 76, "temperature": "98.2F", "respiratoryRate": 16, "spo2": "98%" }, "diagnosisList": [ { "icdCode": "M17.11", "description": "Unilateral primary osteoarthritis", "primary": true } ], "clinicalNotes": "Mild knee pain reported.", "medicalHistory": { "pastConditions": ["Diabetes"], "currentMedications": ["Metformin 500mg"] } } },
];

/**
 * EXPORTED: Fetches the complete details for a single request.
 */
export const getRequestDetails = async (requestId) => {
    console.log(`(apiService) Fetching details for request ID: ${requestId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const requestDetails = MOCK_DB_DATA.find(req => req.requestId === requestId);
    if (requestDetails) {
        return requestDetails;
    } else {
        throw new Error(`Request with ID "${requestId}" not found.`);
    }
};


// --- 2. CORE AGENT LOGIC (for Eligibility and Pre-Auth) ---

/**
 * A single, generic parser for the Eligibility and Pre-Auth agent streams.
 */
const parseAgentEvent = (eventData) => {
  const part = eventData?.content?.parts?.[0];
  const author = eventData?.author;
  if (!part) return null;
  if (part.functionCall) { return { type: 'tool_call', author: author, toolName: part.functionCall.name, args: part.functionCall.args, }; }
  if (part.functionResponse) { const responseContent = JSON.stringify(part.functionResponse.response, null, 2); return { type: 'tool_response', author: author, toolName: part.functionResponse.name, message: responseContent }; }
  if (part.text) { try { let cleanedText = part.text.trim().replace(/^```json\s*|```\s*$/g, ''); const finalJson = JSON.parse(cleanedText); return { type: 'final_decision', author: author, data: finalJson }; } catch (e) { console.error("Failed to parse final decision JSON:", part.text, e); return { type: 'error', author: author, message: "Received final output, but it was not valid JSON." }; } }
  return null;
};

/**
 * A generic function to run the Eligibility and Pre-Auth agent workflows.
 */
const runAgentWorkflow = async (agentName, requestPayload, onEvent, onComplete, onError) => {
    onEvent({ type: 'input', message: JSON.stringify(requestPayload, null, 2) });
    const sessionId = `session-${agentName.replace(/_/g, '-')}-${USER_ID}-${Date.now()}`;
    const sessionUrl = `${BASE_URL}/apps/${agentName}/users/${USER_ID}/sessions/${sessionId}`;
    try {
        onEvent({ type: 'session', message: `Creating session for ${agentName}...` });
        const sessionResponse = await fetch(sessionUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        if (!sessionResponse.ok) throw new Error(`Failed to create session. Status: ${sessionResponse.status}`);
    } catch (error) { onError(error.message); return; }
    try {
        const response = await fetch(`${BASE_URL}/run_sse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appName: agentName, userId: USER_ID, sessionId: sessionId, newMessage: { role: "user", parts: [{ "text": JSON.stringify(requestPayload) }] } }) });
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
                        const agentEvent = parseAgentEvent(eventData);
                        if (agentEvent) {
                            onEvent(agentEvent); // Send the event to the UI
                        }
                    } catch (e) { /* Ignore non-JSON lines */ }
                }
            }
        }
        onComplete();
    } catch (error) { onError(error.message); }
};

/**
 * EXPORTED: Runs the Eligibility agent workflow.
 * This is the "translator" that builds the simple payload the agent expects.
 */
export const runEligibilityAgent = async (caseDetails, onEvent, onComplete, onError) => {
    // The agent still needs to know what action to perform.
    // We'll add the 'action' property to the full caseDetails object.
    const eligibilityRequest = {
        action: "eligibility_check", 
        ...caseDetails // Spread all properties from caseDetails into the request
    };
    await runAgentWorkflow(ELIGIBILITY_AGENT_NAME, eligibilityRequest, onEvent, onComplete, onError);
};

/**
 * EXPORTED: Runs the Pre-Authorization agent workflow.
 * This is the "translator" that builds the simple payload the agent expects.
 */
export const runPreAuthAgent = async (caseDetails, onEvent, onComplete, onError) => {
    const preAuthRequest = {
        member_id: caseDetails.insurance.memberId,
        cpt_code: caseDetails.serviceDetails.cptCode,
        document_paths: [ // The agent expects simple file paths
            `.datas/documents/doctor_notes_${caseDetails.insurance.memberId}.pdf`,
            `.datas/documents/xray_report_${caseDetails.insurance.memberId}.pdf`
        ]
    };
    await runAgentWorkflow(PREAUTH_AGENT_NAME, preAuthRequest, onEvent, onComplete, onError);
};


// --- 3. CHATBOT SECTION ---

const parseChatEvent = (eventData) => {
    const part = eventData?.content?.parts?.[0];
    if (part?.text) {
        return { type: 'text', message: part.text };
    }
    return null;
};

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

export const sendChatMessage = async (message, sessionId, onChunk, onComplete, onError) => {
    const streamPayload = {
        appName: CHATBOT_AGENT_NAME,
        userId: USER_ID,
        sessionId: sessionId,
        newMessage: { role: "user", parts: [{ "text": message }] },
    };

    try {
        const response = await fetch(`${BASE_URL}/run_sse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(streamPayload) });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                onComplete();
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
                            onChunk(chatEvent.message);
                        }
                    } catch (e) { /* Ignore non-JSON lines */ }
                }
            }
        }
    } catch (error) {
        onError(error.message);
    }
};