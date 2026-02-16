import React from "react";

const SuggestedPeers = ({ peers }) => {
  return (
    <div className="card">
      <h2>Suggested Peers</h2>

      <ul style={{ marginTop: "15px", listStyle: "none", padding: 0 }}>
        {peers.map((peer, index) => (
          <li
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8fafc",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "10px"
            }}
          >
            <span>
              {peer.name} - {peer.department}
            </span>

            <button
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Connect
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestedPeers;
