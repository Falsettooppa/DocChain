import React, { useState, useEffect } from "react";
import Web3 from "web3";
import DocumentSharingABI from "./abi/DocumentSharingABI.json";
import UploadDocument from "./components/UploadDocument";
import ViewDocument from "./components/ViewDocument";
import ShareDocument from "./components/ShareDocument";
import DeleteDocument from "./components/DeleteDocument";
import SearchByTag from "./components/SearchByTag";
import CheckAccess from "./components/CheckAccess";
import GetOwnedDocuments from "./components/GetOwnedDocuments";
import SharedWithMe from "./components/SharedWithMe";
import ActivityLog from "./components/ActivityLog";
import AddTags from "./components/AddTags";
import "./App.css";

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
        setGlobalError(
          "MetaMask is not installed. Please install it from https://metamask.io/ to use this DApp."
        );
        setLoading(false);
        return;
      }

      try {
        const provider = window.ethereum.providers
          ? window.ethereum.providers.find((p) => p.isMetaMask)
          : window.ethereum;

        if (!provider) {
          setGlobalError(
            "MetaMask provider not found. Disable other wallet extensions and try again."
          );
          setLoading(false);
          return;
        }

        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);

        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);

        const chainId = parseInt(await web3Instance.eth.getChainId(), 10);

        if (chainId !== 534351) {
          setGlobalError(
            `Wrong network detected. Chain ID: ${chainId}. Please switch to Scroll Sepolia (534351).`
          );

          try {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x8274f" }],
            });
            console.log("Switched to Scroll Sepolia.");
          } catch (switchError) {
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

        const contractInstance = new web3Instance.eth.Contract(
          DocumentSharingABI.abi,
          contractAddress
        );

        setContract(contractInstance);

        console.log("Connected to MetaMask:", accounts[0]);
        console.log("Connected to Contract:", contractAddress);
      } catch (error) {
        setGlobalError(`Failed to initialize DApp: ${error.message || error}`);
        console.error("Initialization Error:", error);
      } finally {
        setLoading(false);
      }
    };

    init();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setGlobalError("Please connect to MetaMask.");
        }
      };

      const handleChainChanged = (chainId) => {
        const parsedChainId = parseInt(chainId, 16);
        if (parsedChainId !== 534351) {
          setGlobalError("Please switch to Scroll Sepolia network.");
        } else {
          window.location.reload();
        }
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
    <div className="app-container">
      <div className="hero">
        <h1>ChainVault</h1>
        <p className="subtitle">
          Decentralised document collaboration and access control powered by blockchain.
        </p>

        <div className="feature-pills">
          <span>Secure Upload</span>
          <span>Shared Access</span>
          <span>IPFS Storage</span>
          <span>On-chain Ownership</span>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Connecting to blockchain... please wait.</p>
      ) : globalError ? (
        <p className="error-message">{globalError}</p>
      ) : (
        <>
          <div className="status-bar">
            <div className="status-item">
              <span className="status-label">Wallet</span>
              <strong>{shortAddress}</strong>
            </div>
            <div className="status-item">
              <span className="status-label">Network</span>
              <strong>Scroll Sepolia</strong>
            </div>
            <div className="status-item">
              <span className="status-label">Contract</span>
              <strong>Connected</strong>
            </div>
          </div>

          {account && contract ? (
            <>
              <div className="section-title">
                <h2>Main Actions</h2>
              </div>

              <div className="dapp-sections">
                <div className="section">
                  <h3>Upload Document</h3>
                  <UploadDocument web3={web3} contract={contract} account={account} />
                </div>

                <div className="section">
                  <h3>View Document</h3>
                  <ViewDocument web3={web3} contract={contract} account={account} />
                </div>

                <div className="section">
                  <h3>Share Document</h3>
                  <ShareDocument web3={web3} contract={contract} account={account} />
                </div>

                <div className="section">
                  <h3>My Documents</h3>
                  <GetOwnedDocuments contract={contract} account={account} />
                </div>
              </div>

              <div className="section-title">
                <h2>Collaboration</h2>
              </div>

              <div className="dapp-sections">
                <div className="section">
                  <h3>Shared With Me</h3>
                  <SharedWithMe contract={contract} account={account} />
                </div>

                <div className="section">
                  <h3>Check Access</h3>
                  <CheckAccess contract={contract} />
                </div>
              </div>

              <div className="section-title">
                <h2>Document Tools</h2>
              </div>

              <div className="dapp-sections">
                <div className="section">
                  <h3>Add Tags</h3>
                  <AddTags web3={web3} contract={contract} account={account} />
                </div>

                <div className="section">
                  <h3>Search By Tag</h3>
                  <SearchByTag web3={web3} contract={contract} account={account} />
                </div>

                <div className="section">
                  <h3>Delete Document</h3>
                  <DeleteDocument contract={contract} account={account} />
                </div>
              </div>

              <div className="section-title">
                <h2>Activity</h2>
              </div>

              <div className="dapp-sections single-column">
                <div className="section">
                  <h3>Activity Log</h3>
                  <ActivityLog contract={contract} account={account} />
                </div>
              </div>
            </>
          ) : (
            <p className="error-message">
              Please connect to MetaMask and switch to Scroll Sepolia to access the DApp.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default App;