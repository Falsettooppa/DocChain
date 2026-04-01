import React, { useEffect, useState, useCallback } from "react";
import { tw } from "../tw";
import Web3 from "web3";

const RPC_URL = "https://sepolia-rpc.scroll.io";
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const CHUNK_SIZE = 2000;

const w3 = new Web3();
const SIG_SHARE = w3.utils.keccak256("DocumentShared(bytes32,address,address)");

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

const fetchLogsChunked = async (topic, fromBlock, toBlock) => {
  const allLogs = [];
  let start = fromBlock;
  while (start <= toBlock) {
    const end = Math.min(start + CHUNK_SIZE - 1, toBlock);
    const logs = await rpc("eth_getLogs", [{
      address: CONTRACT_ADDRESS,
      topics: [topic],
      fromBlock: "0x" + start.toString(16),
      toBlock: "0x" + end.toString(16),
    }]);
    allLogs.push(...logs);
    start = end + 1;
  }
  return allLogs;
};

const SharedWithMe = ({ contract, account }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const fmt = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
  const fmtDate = (ts) => ts ? new Date(Number(ts) * 1000).toLocaleString() : "N/A";

  const copyDocId = async (docId) => {
    try {
      await navigator.clipboard.writeText(docId);
      setCopied(docId);
      setTimeout(() => setCopied(""), 2000);
    } catch { }
  };

  const load = useCallback(async () => {
    if (!contract || !account) return;
    setLoading(true);
    setError("");

    try {
      const latestHex = await rpc("eth_blockNumber", []);
      const latest = parseInt(latestHex, 16);
      const fromBlock = Math.max(0, latest - 50000);

      const sharedLogs = await fetchLogsChunked(SIG_SHARE, fromBlock, latest);

      // DocumentShared — all indexed: docId(topics[1]), from(topics[2]), to(topics[3])
      // Filter only logs where `to` matches current account
      const relevantLogs = sharedLogs.filter((log) => {
        const to = "0x" + log.topics[3].slice(26);
        return to.toLowerCase() === account.toLowerCase();
      });

      // Deduplicate by docId
      const seen = new Set();
      const uniqueDocIds = [];
      for (const log of relevantLogs) {
        const docId = log.topics[1];
        if (!seen.has(docId)) { seen.add(docId); uniqueDocIds.push(docId); }
      }

      // Fetch document details from contract for each docId
      const docs = [];
      for (const docId of uniqueDocIds) {
        try {
          const r = await contract.methods.getDocument(docId).call({ from: account });
          docs.push({
            docId,
            name: r[0],
            ipfsHash: r[1],
            owner: r[2],
            timestamp: r[4],
          });
        } catch {
          // skip docs we can't read (deleted, no access, etc.)
        }
      }

      setDocuments(docs);
    } catch (err) {
      console.error("SharedWithMe error:", err);
      setError(`Failed to load shared documents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => { load(); }, [load]);

return (
  <div className="flex flex-col gap-3">
    <button onClick={load} disabled={loading} className={tw.btnSecondary}>
      {loading ? <>{tw.spinner} Loading…</> : "↻ Refresh"}
    </button>

    {error && <div className={tw.error}>{error}</div>}

    {!loading && !error && documents.length === 0 && (
      <p className="text-gray-500 text-xs py-1">
        No documents have been shared with you yet.
      </p>
    )}

    {documents.length > 0 && (
      <div className="flex flex-col gap-2">
        {documents.map((doc) => (
          <div key={doc.docId} className={`${tw.miniCard} space-y-1.5`}>
            <p className="text-gray-200 font-medium text-sm">{doc.name}</p>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div>
                <span className={tw.miniCardLabel}>Owner</span>
                <p className="text-gray-400 font-mono text-xs">
                  {fmt(doc.owner)}
                </p>
              </div>

              <div>
                <span className={tw.miniCardLabel}>Uploaded</span>
                <p className="text-gray-400 text-xs">
                  {fmtDate(doc.timestamp)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1 flex-wrap">
              <button
                onClick={() => copyDocId(doc.docId)}
                className={`${tw.btnSecondary} !w-auto text-xs px-3 py-1.5`}
              >
                {copied === doc.docId ? "✓ Copied!" : "Copy ID"}
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