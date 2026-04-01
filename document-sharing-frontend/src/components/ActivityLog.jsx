import React, { useEffect, useState, useCallback } from "react";
import { tw } from "../tw";
import Web3 from "web3";

const typeConfig = {
  upload: { label: "Uploaded", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  share:  { label: "Shared",   color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  delete: { label: "Deleted",  color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const RPC_URL = "https://sepolia-rpc.scroll.io";
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const CHUNK_SIZE = 2000; // fetch 2000 blocks at a time

const w3 = new Web3();

const SIG_UPLOAD = w3.utils.keccak256("DocumentUploaded(bytes32,string,string,address,uint256)");
const SIG_SHARE  = w3.utils.keccak256("DocumentShared(bytes32,address,address)");
const SIG_DELETE = w3.utils.keccak256("DocumentDeleted(bytes32)");

const rpc = async (method, params) => {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
};

// Fetch logs in chunks to avoid "block range too large" error
const fetchLogsChunked = async (topic, fromBlock, toBlock) => {
  const allLogs = [];
  let start = fromBlock;

  while (start <= toBlock) {
    const end = Math.min(start + CHUNK_SIZE - 1, toBlock);
    const logs = await rpc("eth_getLogs", [{
      address: CONTRACT_ADDRESS,
      topics: [topic],
      fromBlock: "0x" + start.toString(16),
      toBlock:   "0x" + end.toString(16),
    }]);
    allLogs.push(...logs);
    start = end + 1;
  }

  return allLogs;
};

const ActivityLog = ({ contract, account }) => {
  const [activities, setActivities]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [progress, setProgress]       = useState("");

  const short = (s) => (s ? `${s.slice(0, 8)}…${s.slice(-6)}` : "");

  const load = useCallback(async () => {
    if (!contract || !account) return;
    setLoading(true);
    setError("");
    setProgress("Getting latest block…");

    try {
      const latestHex = await rpc("eth_blockNumber", []);
      const latest = parseInt(latestHex, 16);

      // Only look back 50,000 blocks (~7 days on Scroll Sepolia)
      const fromBlock = Math.max(0, latest - 50000);

      setProgress("Fetching events…");

      const [uploadedLogs, sharedLogs, deletedLogs] = await Promise.all([
        fetchLogsChunked(SIG_UPLOAD, fromBlock, latest),
        fetchLogsChunked(SIG_SHARE,  fromBlock, latest),
        fetchLogsChunked(SIG_DELETE, fromBlock, latest),
      ]);

      setProgress("Processing…");

      // DocumentUploaded — indexed: docId(topics[1]), owner(topics[2])
      // data: name(string), ipfsHash(string), timestamp(uint256)
      const uploads = uploadedLogs
        .map((log) => {
          try {
            const decoded = w3.eth.abi.decodeParameters(["string", "string", "uint256"], log.data);
            const owner   = "0x" + log.topics[2].slice(26);
            return {
              type: "upload",
              blockNumber: parseInt(log.blockNumber, 16),
              txHash: log.transactionHash,
              docId: log.topics[1],
              owner,
              text: `Uploaded "${decoded[0]}"`,
            };
          } catch { return null; }
        })
        .filter((e) => e?.owner.toLowerCase() === account.toLowerCase());

      // DocumentShared — all indexed: docId(topics[1]), from(topics[2]), to(topics[3])
      const shares = sharedLogs
        .map((log) => {
          try {
            const from = "0x" + log.topics[2].slice(26);
            const to   = "0x" + log.topics[3].slice(26);
            return {
              type: "share",
              blockNumber: parseInt(log.blockNumber, 16),
              txHash: log.transactionHash,
              docId: log.topics[1],
              text:
                from.toLowerCase() === account.toLowerCase()
                  ? `Shared with ${to.slice(0, 6)}…${to.slice(-4)}`
                  : `Received from ${from.slice(0, 6)}…${from.slice(-4)}`,
              from,
              to,
            };
          } catch { return null; }
        })
        .filter((e) => e && (
          e.from.toLowerCase() === account.toLowerCase() ||
          e.to.toLowerCase()   === account.toLowerCase()
        ));

      // DocumentDeleted — indexed: docId(topics[1])
      const deletes = deletedLogs
        .map((log) => {
          try {
            return {
              type: "delete",
              blockNumber: parseInt(log.blockNumber, 16),
              txHash: log.transactionHash,
              docId: log.topics[1],
              text: "Deleted document",
            };
          } catch { return null; }
        })
        .filter(Boolean);

      const all = [...uploads, ...shares, ...deletes]
        .sort((a, b) => b.blockNumber - a.blockNumber);

      setActivities(all);
      setProgress("");
    } catch (err) {
      console.error("Activity log error:", err);
      setError(`Failed to load activity: ${err.message}`);
      setProgress("");
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-3">
      <button onClick={load} disabled={loading} className={tw.btnSecondary}>
        {loading ? <>{tw.spinner} {progress || "Loading…"}</> : "↻ Refresh Activity"}
      </button>

      {error && <div className={tw.error}>{error}</div>}

      {!loading && !error && activities.length === 0 && (
        <p className="text-gray-500 text-xs py-1">No activity found in the last 50,000 blocks.</p>
      )}

      {activities.length > 0 && (
        <div className="flex flex-col gap-2">
          {activities.map((a, i) => {
            const cfg = typeConfig[a.type] || typeConfig.upload;
            return (
              <div
                key={`${a.txHash}-${i}`}
                className="flex items-start gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl"
              >
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