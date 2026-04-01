import React, { useState, useEffect } from "react";
import { tw } from "../tw";

export const GetOwnedDocuments = ({ contract, account }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const docIds = await contract.methods.getDocumentsByOwner(account).call();
        setDocuments(docIds);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    if (account && contract) fetch();
  }, [contract, account]);

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-500 text-xs py-2">
      {tw.spinner} Loading documents…
    </div>
  );

  if (documents.length === 0) return (
    <p className="text-gray-500 text-xs py-2">No documents found.</p>
  );

  return (
    <div className="flex flex-col gap-2">
      {documents.map((docId, i) => (
        <div key={i} className={tw.miniCard}>
          <span className={tw.miniCardLabel}>Document {i + 1}</span>
          <p className="text-gray-300 font-mono text-xs break-all mt-0.5">{docId}</p>
        </div>
      ))}
    </div>
  );
};

export const DeleteDocument = ({ contract, account }) => {
  const [docId, setDocId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleDelete = async () => {
    if (!docId) { setMessage({ type: "error", text: "Please provide a valid Document ID." }); return; }
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      await contract.methods.deleteDocument(docId).send({ from: account });
      setMessage({ type: "success", text: "Document deleted successfully." });
      setDocId("");
    } catch (error) {
      console.error("Error deleting document:", error);
      setMessage({ type: "error", text: "Failed to delete document. Ensure you're the owner." });
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
      <button onClick={handleDelete} disabled={loading} className={tw.btnDanger}>
        {loading ? <>{tw.spinner} Deleting…</> : "Delete Document"}
      </button>
      {message.text && (
        <div className={message.type === "error" ? tw.error : tw.success}>{message.text}</div>
      )}
    </div>
  );
};

export const CheckAccess = ({ contract }) => {
  const [docId, setDocId] = useState("");
  const [address, setAddress] = useState("");
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!docId || !address) return;
    try {
      setLoading(true);
      const access = await contract.methods.hasAccess(docId, address).call();
      setHasAccess(access);
    } catch (error) {
      console.error("Error checking access:", error);
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
        <label className={tw.label}>User Address</label>
        <input
          type="text"
          placeholder="0x…"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={tw.input + " font-mono text-xs"}
        />
      </div>
      <button onClick={handleCheck} disabled={loading} className={tw.btn}>
        {loading ? <>{tw.spinner} Checking…</> : "Check Access"}
      </button>
      {hasAccess !== null && (
        <div className={hasAccess ? tw.success : tw.error}>
          {hasAccess ? "✓ This address has access" : "✗ This address does not have access"}
        </div>
      )}
    </div>
  );
};
