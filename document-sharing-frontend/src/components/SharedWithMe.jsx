import React, { useEffect, useState } from "react";
import { tw } from "../tw";

const SharedWithMe = ({ contract, account }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fmt = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
  const fmtDate = (ts) => ts ? new Date(Number(ts) * 1000).toLocaleString() : "N/A";

  const copyDocId = async (docId) => {
    try { await navigator.clipboard.writeText(docId); } catch {}
  };

  const load = async () => {
    if (!contract || !account) return;
    setLoading(true); setError("");
    try {
      const events = await contract.getPastEvents("DocumentShared", {
        filter: { to: account },
        fromBlock: 0,
        toBlock: "latest",
      });
      const unique = [...new Set(events.map((e) => e.returnValues.docId))];
      const docs = [];
      for (const docId of unique) {
        try {
          const r = await contract.methods.getDocument(docId).call({ from: account });
          docs.push({ docId, name: r[0], ipfsHash: r[1], owner: r[2], timestamp: r[4] });
        } catch {}
      }
      setDocuments(docs);
    } catch { setError("Failed to load shared documents."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [contract, account]);

  return (
    <div className="flex flex-col gap-3">
      <button onClick={load} disabled={loading} className={tw.btnSecondary}>
        {loading ? <>{tw.spinner} Loading…</> : "↻ Refresh"}
      </button>

      {error && <div className={tw.error}>{error}</div>}

      {!loading && !error && documents.length === 0 && (
        <p className="text-gray-500 text-xs py-1">No documents have been shared with you yet.</p>
      )}

      {documents.length > 0 && (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <div key={doc.docId} className={tw.miniCard + " space-y-1.5"}>
              <p className="text-gray-200 font-medium text-sm">{doc.name}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                <div>
                  <span className={tw.miniCardLabel}>Owner</span>
                  <p className="text-gray-400 font-mono text-xs">{fmt(doc.owner)}</p>
                </div>
                <div>
                  <span className={tw.miniCardLabel}>Uploaded</span>
                  <p className="text-gray-400 text-xs">{fmtDate(doc.timestamp)}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1 flex-wrap">
                <button onClick={() => copyDocId(doc.docId)} className={tw.btnSecondary + " !w-auto text-xs px-3 py-1.5"}>
                  Copy ID
                </button>
                <a
                  href={doc.ipfsHash}
                  target="_blank"
                  rel="noreferrer"
                  className={tw.linkBtn}
                >
                  View File ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedWithMe;
