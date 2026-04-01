import React, { useState } from "react";
import { tw } from "../tw";

const ShareDocument = ({ contract, web3, account }) => {
  const [docId, setDocId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!docId || !recipient) {
      setMessage({ type: "error", text: "Please provide both the Document ID and Recipient Address." });
      return;
    }
    if (!web3.utils.isAddress(recipient)) {
      setMessage({ type: "error", text: "Invalid recipient address. Ensure it's a valid Ethereum address." });
      return;
    }
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const formattedDocId = web3.utils.padLeft(docId, 64);
      await contract.methods.shareDocument(formattedDocId, recipient).send({ from: account });
      setMessage({ type: "success", text: "Document shared successfully!" });
      setDocId("");
      setRecipient("");
    } catch (error) {
      console.error("Error sharing document:", error);
      if (error.message.includes("Access denied")) {
        setMessage({ type: "error", text: "You don't have permission to share this document." });
      } else if (error.message.includes("Document does not exist")) {
        setMessage({ type: "error", text: "The specified document does not exist. Verify the Document ID." });
      } else {
        setMessage({ type: "error", text: "An error occurred while sharing the document." });
      }
    } finally {
      setLoading(false);
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
      <div>
        <label className={tw.label}>Recipient Address</label>
        <input
          type="text"
          placeholder="0x…"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className={tw.input + " font-mono text-xs"}
        />
      </div>
      <button onClick={handleShare} disabled={loading} className={tw.btn}>
        {loading ? <>{tw.spinner} Sharing…</> : "Share Document"}
      </button>
      {message.text && (
        <div className={message.type === "error" ? tw.error : tw.success}>{message.text}</div>
      )}
    </div>
  );
};

export default ShareDocument;
