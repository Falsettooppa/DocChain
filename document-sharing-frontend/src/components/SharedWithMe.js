import React, { useEffect, useState } from "react";

const SharedWithMe = ({ contract, account }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSharedDocuments = async () => {
    if (!contract || !account) return;

    setLoading(true);
    setError("");

    try {
      const events = await contract.getPastEvents("DocumentShared", {
        filter: { to: account },
        fromBlock: 0,
        toBlock: "latest",
      });

      const uniqueDocIds = [...new Set(events.map((event) => event.returnValues.docId))];

      const docs = [];

      for (const docId of uniqueDocIds) {
        try {
          const result = await contract.methods.getDocument(docId).call({ from: account });

          docs.push({
            docId,
            name: result[0],
            ipfsHash: result[1],
            owner: result[2],
            sharedWith: result[3],
            timestamp: result[4],
          });
        } catch (err) {
          console.warn(`Could not load shared document ${docId}:`, err);
        }
      }

      setDocuments(docs);
    } catch (err) {
      console.error("Error loading shared documents:", err);
      setError("Failed to load shared documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedDocuments();
  }, [contract, account]);

  const formatAddress = (address) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div>
      <button onClick={loadSharedDocuments}>Refresh Shared Documents</button>

      {loading && <p>Loading shared documents...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && documents.length === 0 && <p>No documents have been shared with you yet.</p>}

      {documents.length > 0 && (
        <div>
          {documents.map((doc) => (
            <div key={doc.docId} className="mini-card">
              <p><strong>Name:</strong> {doc.name}</p>
              <p><strong>Owner:</strong> {formatAddress(doc.owner)}</p>
              <p><strong>Document ID:</strong> {doc.docId}</p>
              <p><strong>Uploaded:</strong> {formatDate(doc.timestamp)}</p>
              <p>
                <strong>IPFS:</strong>{" "}
                <a href={doc.ipfsHash} target="_blank" rel="noreferrer">
                  View File
                </a>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedWithMe;