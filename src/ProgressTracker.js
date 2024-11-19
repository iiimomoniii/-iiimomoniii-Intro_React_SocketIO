import React, { useState, useEffect } from "react";

const ProgressTracker = () => {
  const [data, setData] = useState([
    { id: 1, name: "Task 1", status: "Pending", progress: 0 },
    { id: 2, name: "Task 2", status: "Pending", progress: 0 },
    { id: 3, name: "Task 3", status: "Pending", progress: 0 },
  ]); // Simulated data table
  const [currentTaskId, setCurrentTaskId] = useState(null); // Track task in progress
  const [connected, setConnected] = useState(false); // WebSocket connection status

  const handleStartProgress = (taskId) => {
    setCurrentTaskId(taskId); // Set the current task in progress

    const ws = new WebSocket("ws://localhost:3000/progress");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.status === "complete") {
          // Update task to Completed
          setData((prevData) =>
            prevData.map((task) =>
              task.id === taskId
                ? { ...task, status: "Completed", progress: 100 }
                : task
            )
          );
          setCurrentTaskId(null); // Clear the current task
          ws.close(); // Close the WebSocket after completion
        } else {
          // Update progress for the current task
          setData((prevData) =>
            prevData.map((task) =>
              task.id === taskId
                ? { ...task, status: "In Progress", progress: data.progress }
                : task
            )
          );
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setConnected(false);
    };
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Progress Tracker Table</h1>

      {/* Data Table */}
      <table
        border="1"
        style={{
          margin: "0 auto",
          width: "80%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Task Name</th>
            <th>Progress & Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.name}</td>
              <td style={{ textAlign: "center", padding: "10px" }}>
                {task.status === "Pending" ? (
                  <button
                    onClick={() => handleStartProgress(task.id)}
                    disabled={currentTaskId !== null}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      cursor: currentTaskId !== null ? "not-allowed" : "pointer",
                    }}
                  >
                    Start Progress
                  </button>
                ) : task.status === "In Progress" ? (
                  <div>
                    {/* <progress
                      value={task.progress}
                      max="100"
                      style={{ width: "80%" }}
                    ></progress> */}
                    <p>{task.progress.toFixed(2)}%</p>
                  </div>
                ) : (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    Completed
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* WebSocket Connection Status */}
      <p style={{ marginTop: "20px", color: connected ? "green" : "red" }}>
        {connected ? "WebSocket Connected" : "WebSocket Disconnected"}
      </p>
    </div>
  );
};

export default ProgressTracker;
