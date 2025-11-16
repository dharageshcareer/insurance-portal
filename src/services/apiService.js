// ... (imports and configuration at the top remain the same) ...
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const USER_ID = process.env.REACT_APP_USER_ID;
const ELIGIBILITY_AGENT_NAME = process.env.REACT_APP_ELIGIBILITY_AGENT_NAME;
const PREAUTH_AGENT_NAME = process.env.REACT_APP_PREAUTH_AGENT_NAME;

const parseAgentEvent = (eventData) => {
  // ... (this function's code does not change) ...
  const part = eventData?.content?.parts?.[0];
  const author = eventData?.author;
  if (!part) return null;
  if (part.functionCall) { return { type: 'tool_call', author: author, toolName: part.functionCall.name, args: part.functionCall.args, }; }
  if (part.functionResponse) { const responseContent = JSON.stringify(part.functionResponse.response, null, 2); return { type: 'tool_response', author: author, toolName: part.functionResponse.name, message: responseContent }; }
  if (part.text) { try { let cleanedText = part.text.trim().replace(/^```json\s*|```\s*$/g, ''); const finalJson = JSON.parse(cleanedText); return { type: 'final_decision', author: author, data: finalJson }; } catch (e) { console.error("Failed to parse final decision JSON:", part.text, e); return { type: 'error', author: author, message: "Received final output, but it was not valid JSON." }; } }
  return null;
};

// --- THIS FUNCTION IS UPDATED ---
const runAgentWorkflow = async (agentName, requestPayload, onEvent, onComplete, onError) => {
    onEvent({ type: 'input', message: JSON.stringify(requestPayload, null, 2) });
    const sessionId = `session-${agentName.replace(/_/g, '-')}-${USER_ID}-${Date.now()}`;
    const sessionUrl = `${BASE_URL}/apps/${agentName}/users/${USER_ID}/sessions/${sessionId}`;

    try {
        onEvent({ type: 'session', message: `Creating session for ${agentName}...` });
        const sessionResponse = await fetch(sessionUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        if (!sessionResponse.ok) throw new Error(`Failed to create session. Status: ${sessionResponse.status}`);
    } catch (error) {
        onError(error.message);
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/run_sse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appName: agentName, userId: USER_ID, sessionId: sessionId, newMessage: { role: "user", parts: [{ "text": JSON.stringify(requestPayload) }] } }) });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break; // Exit loop when stream ends

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const eventDataStr = line.substring('data: '.length);
                    if (!eventDataStr) continue;
                    try {
                        const eventData = JSON.parse(eventDataStr);
                        const uiEvent = parseAgentEvent(eventData);
                        if (uiEvent) onEvent(uiEvent);
                    } catch (e) { /* Ignore non-JSON lines */ }
                }
            }
        }
        // --- THIS IS THE NEW PART ---
        // After the while loop finishes, call the onComplete callback.
        onComplete();

    } catch (error) {
        onError(error.message);
    }
};

// --- THESE FUNCTIONS ARE UPDATED ---
export const runEligibilityAgent = async (caseDetails, onEvent, onComplete, onError) => {
    const eligibilityRequest = { action: "eligibility_check", member_id: caseDetails.memberId, service_details: caseDetails.serviceDetails, clinical_details: { symptoms: caseDetails.clinicalDetails.symptoms, clinical_history: caseDetails.clinicalDetails.clinicalHistory } };
    await runAgentWorkflow(ELIGIBILITY_AGENT_NAME, eligibilityRequest, onEvent, onComplete, onError);
};

export const runPreAuthAgent = async (caseDetails, onEvent, onComplete, onError) => {
    const preAuthRequest = { member_id: caseDetails.memberId, cpt_code: caseDetails.serviceDetails.cpt_code, document_paths: caseDetails.clinicalDetails.documents.map( doc => `./documents/${doc.name}`) };
    await runAgentWorkflow(PREAUTH_AGENT_NAME, preAuthRequest, onEvent, onComplete, onError);
};