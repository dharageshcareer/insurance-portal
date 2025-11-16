import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css'; // Import library styles
import './AgentTopology.css'; // Our custom styles for the nodes

const AgentTopology = ({ events }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const uniqueNodes = new Map();
    const uniqueEdges = new Set();
    
    // Add the initial user/input as the root node
    uniqueNodes.set('user_input', {
      id: 'user_input',
      type: 'input', // Special type for styling
      data: { label: 'Initial Request' },
      position: { x: 250, y: 0 },
    });

    let lastAgent = 'user_input'; // Start the flow from the user

    events.forEach(event => {
      if (event.type === 'tool_call') {
        const agentId = event.author;
        const toolId = event.toolName;

        // Add agent node if it doesn't exist
        if (!uniqueNodes.has(agentId)) {
          uniqueNodes.set(agentId, {
            id: agentId,
            data: { label: agentId },
            position: { x: 100, y: uniqueNodes.size * 120 },
            className: 'agent-node', // Custom class for styling
          });
        }
        
        // Add tool node if it doesn't exist
        if (!uniqueNodes.has(toolId)) {
            uniqueNodes.set(toolId, {
              id: toolId,
              data: { label: toolId },
              position: { x: 400, y: uniqueNodes.size * 120 },
              className: 'tool-node', // Custom class for styling
            });
        }
        
        // Connect the last agent to the current one
        const entryEdgeId = `e-${lastAgent}-${agentId}`;
        if (lastAgent !== agentId && !uniqueEdges.has(entryEdgeId)) {
            uniqueEdges.add(entryEdgeId);
        }

        // Connect the current agent to the tool it's calling
        const toolEdgeId = `e-${agentId}-${toolId}`;
        if (!uniqueEdges.has(toolEdgeId)) {
            uniqueEdges.add(toolEdgeId);
        }

        // The tool's author becomes the last active agent
        lastAgent = agentId;
      }
    });

    setNodes(Array.from(uniqueNodes.values()));
    setEdges(Array.from(uniqueEdges).map(edgeId => {
        const [_, source, target] = edgeId.split('-');
        return { id: edgeId, source, target, animated: true };
    }));

  }, [events]); // Rerun this logic whenever the events change

  if (!events || events.length === 0) {
    return <div className="flow-placeholder">The agent network will be generated here after the run.</div>;
  }

  return (
    <div className="topology-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView // Automatically zooms to fit all nodes
        proOptions={{ hideAttribution: true }} // Hides the "React Flow" attribution
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default AgentTopology;