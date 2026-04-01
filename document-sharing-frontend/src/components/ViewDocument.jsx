import React, { useState } from "react";
import { tw } from "../tw";

const ViewDocument = ({ contract, web3, account }) => {
  const [docId, setDocId] = useState("");
  const [documentDetails, setDocumentDetails] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleView = async () => {
    if (!docId) { setMessage({ type: "error", text: "Please enter a valid document ID." }); return; }
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      setDocumentDetails(null);

      const details = await contract.methods
        .getDocument(web3.utils.padLeft(docId, 64))
        .call({ from: account });

      if (!details.name || details.owner === "0x0000000000000000000000000000000000000000") {
        setMessage({ type: "error", text: "Document not found or access denied." });
        return;
      }

      let ipfsUrl = details.ipfsHash;
      if (!ipfsUrl.startsWith("http")) ipfsUrl = `https://ipfs.io/ipfs/${details.ipfsHash}`;

      setDocumentDetails({
        name: details.name,
        ipfsHash: details.ipfsHash,
        owner: details.owner,
        timestamp: new Date(parseInt(details.timestamp) * 1000).toLocaleString(),
        ipfsUrl,
      });
    } catch (error) {
      console.error("Error viewing document:", error);
      setMessage({ type: "error", text: "Error fetching document details." });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentDetails?.ipfsUrl) return;
    try {
      const response = await fetch(documentDetails.ipfsUrl);
      if (!response.ok) throw new Error("Failed to fetch the document.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = documentDetails.name; a.click();
      window.URL.revokeObjectURL(url);
      setMessage({ type: "success", text: "Document downloaded successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to download the document." });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={tw.label}>Document ID</label>
        <input
          type="text"
          placeholder="Enter document ID"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          className={tw.input + " font-mono text-xs"}
        />
      </div>

      <button onClick={handleView} disabled={loading} className={tw.btn}>
        {loading ? <>{tw.spinner} Fetching…</> : "View Document"}
      </button>

      {message.text && (
        <div className={message.type === "error" ? tw.error : tw.success}>{message.text}</div>
      )}

      {documentDetails && (
        <div className={tw.miniCard + " space-y-2"}>
          <Row label="Name" value={documentDetails.name} />
          <Row label="Owner" value={`${documentDetails.owner.slice(0, 8)}…${documentDetails.owner.slice(-6)}`} mono />
          <Row label="Uploaded" value={documentDetails.timestamp} />
          <button onClick={handleDownload} className={tw.btnSecondary + " mt-2"}>
            ↓ Download Document
          </button>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value, mono }) => (
  <div>
    <span className={tw.miniCardLabel}>{label}</span>
    <p className={`${tw.miniCardValue} ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
  </div>
);

export default ViewDocument;
