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
import AddTags from "./components/AddTags";
import "./App.css"; // Example for custom or framework styling

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
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAccount(accounts[0]);

                const chainId = parseInt(await web3Instance.eth.getChainId(), 10);
                if (chainId !== 534351) {
                    setGlobalError(
                        `Wrong network detected. Chain ID: ${chainId}. Please switch to Scroll Sepolia (534351).`
                    );

                    // Attempt to switch network
                    try {
                        await window.ethereum.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: "0x82c9" }],
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

                const contractInstance = new web3Instance.eth.Contract(DocumentSharingABI.abi, contractAddress);
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
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                    setGlobalError("Please connect to MetaMask.");
                }
            });

            window.ethereum.on("chainChanged", (chainId) => {
                const parsedChainId = parseInt(chainId, 16);
                if (parsedChainId !== 534351) {
                    setGlobalError("Please switch to Scroll Sepolia network.");
                } else {
                    window.location.reload();
                }
            });
        }
    }, []);

    return (
        <div className="app-container">
            <h1>Document Sharing DApp</h1>
            {loading ? (
                <p>Loading... Please wait.</p>
            ) : globalError ? (
                <p className="error-message">{globalError}</p>
            ) : (
                <>
                    <p>
                        Connected Account:{" "}
                        <span className="connected-account">{account || "Not Connected"}</span>
                    </p>
                    {account && contract ? (
                        <div className="dapp-sections">
                            <div className="section">
                                <UploadDocument web3={web3} contract={contract} account={account} />
                            </div>
                            <div className="section">
                                <ViewDocument web3={web3} contract={contract} account={account} />
                            </div>
                            <div className="section">
                                <ShareDocument web3={web3} contract={contract} account={account} />
                            </div>
                            <div className="section">
                                <DeleteDocument contract={contract} account={account} />
                            </div>
                            <div className="section">
                                <AddTags web3={web3} contract={contract} account={account} />
                            </div>
                            <div className="section">
                                <SearchByTag web3={web3} contract={contract} account={account} />
                            </div>
                            <div className="section">
                                <CheckAccess contract={contract} />
                            </div>
                            <div className="section">
                                <GetOwnedDocuments contract={contract} account={account} />
                            </div>
                        </div>
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