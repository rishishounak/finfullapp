import React, { useState, useCallback } from "react";
import { stringify } from "flatted";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Start" },
    position: { x: 250, y: 5 },
  },
];

const initialEdges = [];

const FlowChart = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDetails, setNodeDetails] = useState({
    subject: "",
    body: "",
    time: "",
    date: "",
    days: "",
    emails: "",
  });

  const [isFlowSaved, setIsFlowSaved] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type) => {
    const id = (nodes.length + 1).toString();
    const newNode = {
      id,
      data: { label: type },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => [...nds, newNode]);

    if (nodes.length > 0) {
      setEdges((eds) => [
        ...eds,
        { id: `e${nodes[nodes.length - 1].id}-${id}`, source: nodes[nodes.length - 1].id, target: id },
      ]);
    }
  };

  const handleNodeClick = (event, node) => {
    if (
      node.data.label === "Cold Email" ||
      node.data.label === "Wait" ||
      node.data.label === "Lead Source"
    ) {
      setSelectedNode(node);
    }
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setNodeDetails((prev) => ({ ...prev, [name]: value }));
  };

  const saveNodeDetails = () => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                details: { ...nodeDetails },
                label:
                  selectedNode.data.label === "Cold Email" ? (
                    <div>
                      <strong>Cold Email</strong>
                      <br />
                      <small>Subject: {nodeDetails.subject}</small>
                      <br />
                      <small>Date: {nodeDetails.date}</small>
                      <br />
                      <small>Time: {nodeDetails.time}</small>
                    </div>
                  ) : selectedNode.data.label === "Wait" ? (
                    <div>
                      <strong>Wait</strong>
                      <br />
                      <small>Days: {nodeDetails.days}</small>
                    </div>
                  ) : (
                    <div>
                      <strong>Lead Source</strong>
                      <br />
                      <small>Email IDs: {nodeDetails.emails.split(",").length}</small>
                    </div>
                  ),
              },
            }
          : node
      )
    );
    setSelectedNode(null);
    setNodeDetails({ subject: "", body: "", time: "", date: "", days: "", emails: "" });
  };

  const saveFlowchart = () => {
    setIsFlowSaved(true);
  };

  const sendToBackend = async () => {
    if (!isFlowSaved) {
      alert("Please save the flowchart before sending.");
      return;
    }

   

    console.log("these are nodes",nodes);
    const arr1={'body':'',
      'date':'',
      'days':'',
      'emails':'',
      'subject':'',
      'time':''};
    const keys1=Object.keys(arr1);
    for(let i=0;i<nodes.length;i++){
      if(nodes[i].data.details){
      const dets1=nodes[i].data.details;
      console.log('hi these are dets',dets1)
      for(let j=0;j<keys1.length;j++){
        console.log('check 2');
        if(keys1[j] in dets1 && dets1[keys1[j]]!==''){
          console.log('check3');
          if(arr1[keys1[j]]===''){
            console.log('yo man what you doing');
          arr1[keys1[j]]=dets1[keys1[j]];
          }
        }
      }
    }

    }

    console.log('the collected dets are',arr1);
    
    // console.log('these are dets',flowchartJsonString);
    
    
    // // Usage Example
    // const jsonString = collectFlowchartDetails(nodes);
    // console.log(jsonString);
    
    console.log('these are node 1 details',nodes[1].data.details)
    console.log("these are edges", edges);

    const flowchartData = { nodes, edges };

    try {
      const response = await fetch("http://localhost:5000/api/save-flowchart", {
        method: "POST",
        // mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arr1),
      });

      if (response.ok) {
        alert("Flowchart saved and sent to backend successfully!");
      } else {
        alert("Failed to send flowchart to backend.");
      }
    } catch (error) {
      console.error("Error sending flowchart:", error);
      console.error("Stack Trace:", error.stack);
      alert("Error sending flowchart to backend.");
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      <div style={{ position: "absolute", top: 10, right: 10 }}>
        <button onClick={() => addNode("Cold Email")}>Add Cold Email</button>
        <button onClick={() => addNode("Wait")}>Add Wait</button>
        <button onClick={() => addNode("Lead Source")}>Add Lead Source</button>
        <button onClick={saveFlowchart}>Save Flowchart</button>
        <button onClick={sendToBackend}>Send to Backend</button>
      </div>

      {selectedNode && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "20%",
            width: "300px",
            padding: "20px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            zIndex: 10,
          }}
        >
          <h3>
            {selectedNode.data.label === "Cold Email"
              ? "Cold Email Details"
              : selectedNode.data.label === "Wait"
              ? "Wait Node Details"
              : "Lead Source Details"}
          </h3>
          {selectedNode.data.label === "Cold Email" && (
            <>
              <label>
                Subject:
                <input
                  type="text"
                  name="subject"
                  value={nodeDetails.subject}
                  onChange={handleDetailChange}
                  style={{ width: "100%", marginBottom: "10px" }}
                />
              </label>
              <label>
                Body:
                <textarea
                  name="body"
                  value={nodeDetails.body}
                  onChange={handleDetailChange}
                  style={{ width: "100%", marginBottom: "10px" }}
                />
              </label>
              <label>
                Date:
                <input
                  type="date"
                  name="date"
                  value={nodeDetails.date}
                  onChange={handleDetailChange}
                  style={{ width: "100%", marginBottom: "10px" }}
                />
              </label>
              <label>
                Time:
                <input
                  type="time"
                  name="time"
                  value={nodeDetails.time}
                  onChange={handleDetailChange}
                  style={{ width: "100%", marginBottom: "10px" }}
                />
              </label>
            </>
          )}
          {selectedNode.data.label === "Wait" && (
            <label>
              Days:
              <input
                type="number"
                name="days"
                value={nodeDetails.days}
                onChange={handleDetailChange}
                style={{ width: "100%", marginBottom: "10px" }}
              />
            </label>
          )}
          {selectedNode.data.label === "Lead Source" && (
            <label>
              Email IDs (comma-separated):
              <textarea
                name="emails"
                value={nodeDetails.emails}
                onChange={handleDetailChange}
                style={{ width: "100%", marginBottom: "10px" }}
              />
            </label>
          )}
          <button onClick={saveNodeDetails} style={{ marginRight: "10px" }}>
            Save
          </button>
          <button onClick={() => setSelectedNode(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default FlowChart;