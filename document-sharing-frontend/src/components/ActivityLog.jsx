import React, { useEffect, useState } from "react";
import { tw } from "../tw";

const typeConfig = {
  upload: { label: "Uploaded", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  share:  { label: "Shared",   color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  delete: { label: "Deleted",  color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const ActivityLog = ({ contract, account }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const short = (s) => s ? `${s.slice(0, 8)}…${s.slice(-6)}` : "";

  const load = async () => {
    if (!contract || !account) return;
    setLoading(true); setError("");
    try {
      const [uploaded, shared, deleted] = await Promise.all([
        contract.getPastEvents("DocumentUploaded", { fromBlock: 0, toBlock: "latest" }),
        contract.getPastEvents("DocumentShared",   { fromBlock: 0, toBlock: "latest" }),
        contract.getPastEvents("DocumentDeleted",  { fromBlock: 0, toBlock: "latest" }),
      ]);

      const uploads = uploaded
        .filter((e) => e.returnValues.owner.toLowerCase() === account.toLowerCase())
        .map((e) => ({ type: "upload", blockNumber: e.blockNumber, txHash: e.transactionHash, docId: e.returnValues.docId, text: `Uploaded "${e.returnValues.name}"` }));

      const shares = shared
        .filter((e) => e.returnValues.from.toLowerCase() === account.toLowerCase() || e.returnValues.to.toLowerCase() === account.toLowerCase())
        .map((e) => ({
          type: "share", blockNumber: e.blockNumber, txHash: e.transactionHash, docId: e.returnValues.docId,
          text: e.returnValues.from.toLowerCase() === account.toLowerCase()
            ? `Shared with ${e.returnValues.to.slice(0, 6)}…${e.returnValues.to.slice(-4)}`
            : `Received from ${e.returnValues.from.slice(0, 6)}…${e.returnValues.from.slice(-4)}`,
        }));

      const deletes = deleted
        .filter((e) => e.returnValues.docId)
        .map((e) => ({ type: "delete", blockNumber: e.blockNumber, txHash: e.transactionHash, docId: e.returnValues.docId, text: `Deleted document` }));

      setActivities([...uploads, ...shares, ...deletes].sort((a, b) => b.blockNumber - a.blockNumber));
    } catch { setError("Failed to load activity log."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [contract, account]);

  return (
    <div className="flex flex-col gap-3">
      <button onClick={load} disabled={loading} className={tw.btnSecondary}>
        {loading ? <>{tw.spinner} Loading…</> : "↻ Refresh Activity"}
      </button>

      {error && <div className={tw.error}>{error}</div>}

      {!loading && !error && activities.length === 0 && (
        <p className="text-gray-500 text-xs py-1">No recent activity found.</p>
      )}

      {activities.length > 0 && (
        <div className="flex flex-col gap-2">
          {activities.map((a, i) => {
            const cfg = typeConfig[a.type] || typeConfig.upload;
            return (
              <div key={`${a.txHash}-${i}`} className="flex items-start gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl">
                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                  {cfg.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 text-sm">{a.text}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-500 text-xs">Block {a.blockNumber}</span>
                    <span className="text-gray-600 text-xs font-mono truncate">{short(a.docId)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
