import React, { useState, useEffect } from "react";
import Web3 from "web3";
import DocumentSharingABI from "./abi/DocumentSharingABI.json";
import UploadDocument from "./components/UploadDocument";
import ViewDocument from "./components/ViewDocument";
import ShareDocument from "./components/ShareDocument";
import SharedWithMe from "./components/SharedWithMe";
import ActivityLog from "./components/ActivityLog";
import { GetOwnedDocuments } from "./components/DocActions";
import { DeleteDocument } from "./components/DocActions";
import { CheckAccess } from "./components/DocActions";
import { AddTags } from "./components/TagComponents";
import { SearchByTag } from "./components/TagComponents";

const App = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setGlobalError("");

      if (!window.ethereum) {
        setGlobalError("MetaMask is not installed. Please install it from https://metamask.io/ to use this DApp.");
        setLoading(false);
        return;
      }

      try {
        const provider = window.ethereum.providers
          ? window.ethereum.providers.find((p) => p.isMetaMask)
          : window.ethereum;

        if (!provider) {
          setGlobalError("MetaMask provider not found. Disable other wallet extensions and try again.");
          setLoading(false);
          return;
        }

        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);

        const accounts = await provider.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const chainId = parseInt(await web3Instance.eth.getChainId(), 10);

        if (chainId !== 534351) {
          setGlobalError(`Wrong network detected. Chain ID: ${chainId}. Please switch to Scroll Sepolia (534351).`);
          try {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x8274f" }],
            });
          } catch {
            setGlobalError("Please manually switch to Scroll Sepolia in MetaMask.");
          }
          setLoading(false);
          return;
        }

        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        if (!contractAddress) {
          setGlobalError("Contract address is missing. Check your .env file.");
          setLoading(false);
          return;
        }

        const contractInstance = new web3Instance.eth.Contract(DocumentSharingABI.abi, contractAddress);
        setContract(contractInstance);
      } catch (error) {
        setGlobalError(`Failed to initialise DApp: ${error.message || error}`);
      } finally {
        setLoading(false);
      }
    };

    init();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) setAccount(accounts[0]);
        else { setAccount(null); setGlobalError("Please connect to MetaMask."); }
      };
      const handleChainChanged = (chainId) => {
        const parsed = parseInt(chainId, 16);
        if (parsed !== 534351) setGlobalError("Please switch to Scroll Sepolia network.");
        else window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "Not Connected";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top nav bar */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">ChainVault</span>
          </div>
          {account && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-400 font-mono">{shortAddress}</span>
              <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Scroll Sepolia
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-20">

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
            Decentralised Document Vault
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-6">
            Secure document collaboration and access control powered by blockchain and IPFS.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Secure Upload", "Shared Access", "IPFS Storage", "On-chain Ownership"].map((pill) => (
              <span key={pill} className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300">
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm">Connecting to blockchain…</span>
          </div>
        )}

        {/* Global error */}
        {!loading && globalError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-2xl mx-auto">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>{globalError}</span>
          </div>
        )}

        {/* Main content */}
        {!loading && !globalError && (
          <>
            {/* Status bar */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { label: "Wallet", value: shortAddress, mono: true },
                { label: "Network", value: "Scroll Sepolia" },
                { label: "Contract", value: "Connected", green: true },
              ].map(({ label, value, mono, green }) => (
                <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <span className="block text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">{label}</span>
                  <span className={`block text-sm font-semibold truncate ${mono ? "font-mono text-gray-300" : green ? "text-emerald-400" : "text-white"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {account && contract ? (
              <div className="space-y-10">

                {/* Main Actions */}
                <Section title="Main Actions">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card title="Upload Document" icon="⬆">
                      <UploadDocument web3={web3} contract={contract} account={account} />
                    </Card>
                    <Card title="View Document" icon="🔍">
                      <ViewDocument web3={web3} contract={contract} account={account} />
                    </Card>
                    <Card title="Share Document" icon="↗">
                      <ShareDocument web3={web3} contract={contract} account={account} />
                    </Card>
                    <Card title="My Documents" icon="📁">
                      <GetOwnedDocuments contract={contract} account={account} />
                    </Card>
                  </div>
                </Section>

                {/* Collaboration */}
                <Section title="Collaboration">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card title="Shared With Me" icon="👥">
                      <SharedWithMe contract={contract} account={account} />
                    </Card>
                    <Card title="Check Access" icon="🔐">
                      <CheckAccess contract={contract} />
                    </Card>
                  </div>
                </Section>

                {/* Document Tools */}
                <Section title="Document Tools">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card title="Add Tags" icon="🏷">
                      <AddTags web3={web3} contract={contract} account={account} />
                    </Card>
                    <Card title="Search by Tag" icon="🔎">
                      <SearchByTag web3={web3} contract={contract} account={account} />
                    </Card>
                    <Card title="Delete Document" icon="🗑">
                      <DeleteDocument contract={contract} account={account} />
                    </Card>
                  </div>
                </Section>

                {/* Activity */}
                <Section title="Activity">
                  <Card title="Activity Log" icon="📋">
                    <ActivityLog contract={contract} account={account} web3={web3} />
                  </Card>
                </Section>

              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm py-10">
                Please connect to MetaMask and switch to Scroll Sepolia to access the DApp.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

/* ── Shared layout primitives ── */

const Section = ({ title, children }) => (
  <div>
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px bg-gray-800" />
    </div>
    {children}
  </div>
);

const Card = ({ title, icon, children }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
    <div className="flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    <div className="flex flex-col gap-3">
      {children}
    </div>
  </div>
);

export default App;
