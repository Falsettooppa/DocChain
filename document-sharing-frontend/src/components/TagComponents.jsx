import React, { useState } from "react";
import { tw } from "../tw";

export const AddTags = ({ contract, web3, account }) => {
  const [docId, setDocId] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAddTags = async () => {
    if (!docId || !tags) {
      setMessage({ type: "error", text: "Please provide Document ID and at least one tag." });
      return;
    }
    const tagArray = tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (tagArray.length === 0) {
      setMessage({ type: "error", text: "Please enter valid tags." });
      return;
    }
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const formattedDocId = web3.utils.padLeft(docId, 64);
      await contract.methods.addTags(formattedDocId, tagArray).send({ from: account });
      setMessage({ type: "success", text: "Tags added successfully!" });
      setDocId(""); setTags("");
    } catch (error) {
      console.error("Error adding tags:", error);
      setMessage({ type: "error", text: "Failed to add tags. Ensure you're the document owner." });
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
        <label className={tw.label}>Tags (comma-separated)</label>
        <input
          type="text"
          placeholder="e.g. invoice, q4, finance"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={tw.input}
        />
      </div>
      <button onClick={handleAddTags} disabled={loading} className={tw.btn}>
        {loading ? <>{tw.spinner} Adding…</> : "Add Tags"}
      </button>
      {message.text && (
        <div className={message.type === "error" ? tw.error : tw.success}>{message.text}</div>
      )}
    </div>
  );
};

export const SearchByTag = ({ contract, account }) => {
  const [tag, setTag] = useState("");
  const [documentIds, setDocumentIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSearch = async () => {
    if (!tag) { setMessage({ type: "error", text: "Please enter a tag to search." }); return; }
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      setDocumentIds([]);
      const normalized = tag.trim().toLowerCase();
      const docIds = await contract.methods.searchByTag(normalized).call({ from: account });
      const filtered = docIds.filter(
        (id) => id !== "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      if (filtered.length === 0) setMessage({ type: "error", text: "No documents found for this tag." });
      else setDocumentIds(filtered);
    } catch (error) {
      console.error("Error searching by tag:", error);
      setMessage({ type: "error", text: "Failed to search documents by tag." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={tw.label}>Tag</label>
        <input
          type="text"
          placeholder="e.g. invoice"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className={tw.input}
        />
      </div>
      <button onClick={handleSearch} disabled={loading} className={tw.btn}>
        {loading ? <>{tw.spinner} Searching…</> : "Search"}
      </button>
      {message.text && (
        <div className={message.type === "error" ? tw.error : tw.success}>{message.text}</div>
      )}
      {documentIds.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={tw.miniCardLabel}>{documentIds.length} result{documentIds.length !== 1 ? "s" : ""}</span>
          {documentIds.map((docId, i) => (
            <div key={i} className={tw.miniCard}>
              <p className="text-gray-300 font-mono text-xs break-all">{docId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
