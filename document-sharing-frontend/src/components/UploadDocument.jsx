import React, { useState } from "react";
import { uploadToPinata } from "../utils/pinata";
import { tw } from "../tw";

const UploadDocument = ({ contract, account }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [docId, setDocId] = useState("");

  const uploadDocument = async () => {
    if (!name || !file) {
      setMessage({ type: "error", text: "Please provide both a name and a file." });
      return;
    }
    try {
      setUploading(true);
      setMessage({ type: "info", text: "Uploading file to IPFS…" });

      const ipfsURL = await uploadToPinata(file);
      setIpfsUrl(ipfsURL);

      setMessage({ type: "info", text: "Saving document to blockchain…" });

      const receipt = await contract.methods.uploadDocument(name, ipfsURL).send({ from: account });
      const event = receipt.events.DocumentUploaded;

      if (event) {
        setDocId(event.returnValues.docId);
        setMessage({ type: "success", text: "Document uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to retrieve Document ID from the blockchain." });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      setMessage({ type: "error", text: "Failed to upload document. Check the console for details." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={tw.label}>Document Name</label>
        <input
          type="text"
          placeholder="e.g. Q4 Report 2024"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={uploading}
          className={tw.input}
        />
      </div>

      <div>
        <label className={tw.label}>File</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={uploading}
          className="w-full text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 cursor-pointer file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-indigo-600/30 file:text-indigo-300 file:text-xs hover:border-gray-600 transition-colors disabled:opacity-50"
        />
      </div>

      <button onClick={uploadDocument} disabled={uploading} className={tw.btn}>
        {uploading ? <>{tw.spinner} Uploading…</> : "Upload Document"}
      </button>

      {message.text && (
        <div className={message.type === "error" ? tw.error : message.type === "success" ? tw.success : "text-xs text-gray-400"}>
          {message.text}
        </div>
      )}

      {ipfsUrl && (
        <div className={tw.miniCard}>
          <div className="space-y-1.5">
            <div>
              <span className={tw.miniCardLabel}>Document Name</span>
              <p className={tw.miniCardValue}>{name}</p>
            </div>
            <div>
              <span className={tw.miniCardLabel}>Document ID</span>
              <p className="text-gray-300 text-xs font-mono break-all mt-0.5">{docId}</p>
            </div>
            <div>
              <span className={tw.miniCardLabel}>IPFS</span>
              <a href={ipfsUrl} target="_blank" rel="noopener noreferrer" className={tw.linkBtn + " mt-1"}>
                View on IPFS ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocument;
