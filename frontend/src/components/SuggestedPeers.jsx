function SuggestedPeers() {
  const peers = ["Rahul - Data Structures", "Ananya - Signals", "Vikram - Networks"];

  return (
    <div className="peer-card">
      <h2>Suggested Peers</h2>
      <ul>
        {peers.map((peer, index) => (
          <li key={index}>{peer}</li>
        ))}
      </ul>
    </div>
  );
}

export default SuggestedPeers;
