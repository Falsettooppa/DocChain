import React, { useEffect, useState } from "react";

const ActivityLog = ({ contract, account }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadActivity = async () => {
    if (!contract || !account) return;

    setLoading(true);
    setError("");

    try {
      const uploadedEvents = await contract.getPastEvents("DocumentUploaded", {
        fromBlock: 0,
        toBlock: "latest",
      });

      const sharedEvents = await contract.getPastEvents("DocumentShared", {
        fromBlock: 0,
        toBlock: "latest",
      });

      const deletedEvents = await contract.getPastEvents("DocumentDeleted", {
        fromBlock: 0,
        toBlock: "latest",
      });

      const formattedUploads = uploadedEvents
        .filter((event) => event.returnValues.owner.toLowerCase() === account.toLowerCase())
        .map((event) => ({
          type: "upload",
          blockNumber: event.blockNumber,
          txHash: event.transactionHash,
          docId: event.returnValues.docId,
          text: `Uploaded "${event.returnValues.name}"`,
          timestamp: event.returnValues.timestamp,
        }));

      const formattedShares = sharedEvents
        .filter(
          (event) =>
            event.returnValues.from.toLowerCase() === account.toLowerCase() ||
            event.returnValues.to.toLowerCase() === account.toLowerCase()
        )
        .map((event) => ({
          type: "share",
          blockNumber: event.blockNumber,
          txHash: event.transactionHash,
          docId: event.returnValues.docId,
          text:
            event.returnValues.from.toLowerCase() === account.toLowerCase()
              ? `Shared document with ${event.returnValues.to.slice(0, 6)}...${event.returnValues.to.slice(-4)}`
              : `Received shared document from ${event.returnValues.from.slice(0, 6)}...${event.returnValues.from.slice(-4)}`,
        }));

      const formattedDeletes = deletedEvents.map((event) => ({
        type: "delete",
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
        docId: event.returnValues.docId,
        text: `Deleted document ${event.returnValues.docId.slice(0, 10)}...`,
      }));

      const allActivities = [...formattedUploads, ...formattedShares, ...formattedDeletes]
        .sort((a, b) => b.blockNumber - a.blockNumber);

      setActivities(allActivities);
    } catch (err) {
      console.error("Error loading activity log:", err);
      setError("Failed to load activity log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [contract, account]);

  return (
    <div>
      <button onClick={loadActivity}>Refresh Activity</button>

      {loading && <p>Loading activity...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && activities.length === 0 && <p>No recent activity found.</p>}

      {activities.length > 0 && (
        <div>
          {activities.map((activity, index) => (
            <div key={`${activity.txHash}-${index}`} className="mini-card">
              <p><strong>{activity.text}</strong></p>
              <p><strong>Type:</strong> {activity.type}</p>
              <p><strong>Document ID:</strong> {activity.docId}</p>
              <p><strong>Block:</strong> {activity.blockNumber}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;