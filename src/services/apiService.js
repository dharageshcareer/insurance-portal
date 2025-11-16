// --- Configuration from .env file ---
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const AGENT_NAME = process.env.REACT_APP_ELIGIBILITY_AGENT_NAME;
const USER_ID = process.env.REACT_APP_USER_ID;

/**
 * Parses a raw event from the ADK stream and standardizes it for our UI components.
 * This function now explicitly extracts the tool name for better UI display.
 * @param {object} eventData - The raw event data from the stream.
 * @returns {object|null} A standardized event object for the UI.
 */
const parseAgentEvent = (eventData) => {
  const part = eventData?.content?.parts?.[0];
  if (!part) return null;

  if (part.functionCall) {
    const toolName = part.functionCall.name;
    // Return a structured object with the toolName
    return { type: 'tool_call', toolName: toolName, message: `Calling tool...` };
  }
  
  if (part.functionResponse) {
    const toolName = part.functionResponse.name;
    // Return a structured object with the toolName
    return { type: 'tool_response', toolName: toolName, message: `Received response.` };
  }
  
  if (part.text) {
    try {
      // Clean the text which might be wrapped in markdown code blocks
      let cleanedText = part.text.trim().replace(/^```json\s*|```\s*$/g, '');
      const finalJson = JSON.parse(cleanedText);
      return { type: 'final_decision', data: finalJson };
    } catch (e) {
      console.error("Failed to parse final decision JSON:", part.text, e);
      return { type: 'error', message: "Received final output, but it was not valid JSON." };
    }
  }

  return null;
};

/**
 * Main function to run the entire ADK agent workflow.
 * @param {object} caseDetails - The details of the case from the UI.
 * @param {function} onEvent - Callback to send UI events to the DetailPage component.
 * @param {function} onError - Callback for any fatal errors.
 */
export const runEligibilityAgent = async (caseDetails, onEvent, onError) => {
  
  // --- STEP 1: CREATE THE SESSION (using standard fetch) ---
  const sessionId = `session-${USER_ID}-${Date.now()}`;
  const sessionUrl = `${BASE_URL}/apps/${AGENT_NAME}/users/${USER_ID}/sessions/${sessionId}`;

  try {
    onEvent({ type: 'session', message: `Creating session: ${sessionId}` });
    const sessionResponse = await fetch(sessionUrl, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (!sessionResponse.ok) {
      if (sessionResponse.status === 404) {
        throw new Error(`Session creation failed (404 Not Found). Is the AGENT_NAME ('${AGENT_NAME}') correct?`);
      }
      const errorBody = await sessionResponse.text();
      throw new Error(`Failed to create session. Status: ${sessionResponse.status}. Body: ${errorBody}`);
    }
  } catch (error) {
    console.error(error);
    onError(error.message);
    return; // Stop the process if session creation fails
  }

  // --- STEP 2: RUN THE AGENT AND STREAM THE RESPONSE (using native fetch) ---
  const eligibilityRequest = {
    action: "eligibility_check",
    member_id: caseDetails.memberId,
    service_details: caseDetails.serviceDetails,
    clinical_details: {
      symptoms: caseDetails.clinicalDetails.symptoms,
      clinical_history: caseDetails.clinicalDetails.clinicalHistory
    }
  };

  const payload = {
    appName: AGENT_NAME,
    userId: USER_ID,
    sessionId: sessionId,
    newMessage: {
      role: "user",
      parts: [{ "text": JSON.stringify(eligibilityRequest) }]
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/run_sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Loop forever to read from the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break; // The stream has finished
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        // SSE events start with "data: "
        if (line.startsWith('data: ')) {
          const eventDataStr = line.substring('data: '.length);
          if (!eventDataStr) continue; // Skip empty data lines

          try {
            const eventData = JSON.parse(eventDataStr);
            const uiEvent = parseAgentEvent(eventData);

            if (uiEvent) {
              // Send the processed event back to the UI component
              onEvent(uiEvent);

              // If we have the final answer, we can stop reading the stream
              if (uiEvent.type === 'final_decision' || uiEvent.type === 'error') {
                reader.cancel(); // Stop the stream
                return;        // Exit the function
              }
            }
          } catch (e) {
            console.warn("Could not parse a line from the stream as JSON:", eventDataStr);
          }
        }
      }
    }
  } catch (error) {
    console.error(`\n--- ERROR: FAILED DURING QUERY ---\nDetails:`, error);
    onError(error.message);
  }
};