// import React, { useState } from "react";

// const ViewDocument = ({ contract, web3, account }) => {
//     const [docId, setDocId] = useState("");
//     const [documentDetails, setDocumentDetails] = useState(null);
//     const [errorMessage, setErrorMessage] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleView = async () => {
//         if (!web3 || !contract) {
//             setErrorMessage("Web3 or contract is not initialised. Please ensure the application is properly set up.");
//             return;
//         }

//         if (!docId) {
//             setErrorMessage("Please enter a valid document ID.");
//             return;
//         }

//         try {
//             setLoading(true);
//             setErrorMessage("");

//             // Ensure the document ID is properly formatted
//             const formattedDocId = web3.utils.padLeft(docId, 64);
//             console.log("Fetching document with docId:", formattedDocId);

//             const details = await contract.methods.getDocument(formattedDocId).call({ from: account });
//             console.log("Fetched document details:", details);

//             // Check if the document exists
//             if (!details.name || details.owner === "0x0000000000000000000000000000000000000000") {
//                 setErrorMessage("Document not found or has been deleted.");
//                 setDocumentDetails(null);
//                 return;
//             }

//             // Construct IPFS download URL
//             const downloadUrl = `https://ipfs.io/ipfs/${details.ipfsHash}`;

//             // Set document details
//             setDocumentDetails({
//                 name: details.name,
//                 ipfsHash: details.ipfsHash,
//                 owner: details.owner,
//                 sharedWithArray: details.sharedWithArray || [],
//                 timestamp: details.timestamp
//                     ? new Date(parseInt(details.timestamp) * 1000).toLocaleString()
//                     : "N/A",
//                 downloadUrl,
//             });
//         } catch (error) {
//             console.error("Error fetching document:", error);

//             if (error.message.includes("Document does not exist")) {
//                 setErrorMessage("Document not found or has been deleted.");
//             } else if (error.message.includes("Access denied")) {
//                 setErrorMessage("You don't have access to this document.");
//             } else {
//                 setErrorMessage("Failed to fetch document details. Check the console for more information.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div>
//             <h3>View Document</h3>
//             <input
//                 type="text"
//                 placeholder="Enter Document ID"
//                 value={docId}
//                 onChange={(e) => setDocId(e.target.value)}
//             />
//             <button onClick={handleView} disabled={loading}>
//                 {loading ? "Loading..." : "View Document"}
//             </button>
//             {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
//             {documentDetails && (
//                 <div>
//                     <p><strong>Name:</strong> {documentDetails.name}</p>
//                     <p>
//                         <strong>IPFS Hash:</strong>{" "}
//                         <a href={documentDetails.downloadUrl} target="_blank" rel="noopener noreferrer">
//                             {documentDetails.ipfsHash}
//                         </a>
//                     </p>
//                     <button onClick={() => window.open(documentDetails.downloadUrl, "_blank")}>
//                         Download Document
//                     </button>
//                     <p><strong>Owner:</strong> {documentDetails.owner}</p>
//                     <p>
//                         <strong>Shared With:</strong>{" "}
//                         {documentDetails.sharedWithArray.length > 0 ? documentDetails.sharedWithArray.join(", ") : "No one"}
//                     </p>
//                     <p><strong>Timestamp:</strong> {documentDetails.timestamp}</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ViewDocument;
// import React, { useState } from "react";

// const ViewDocument = ({ contract, web3, account }) => {
//     const [docId, setDocId] = useState("");
//     const [documentDetails, setDocumentDetails] = useState(null);
//     const [errorMessage, setErrorMessage] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleView = async () => {
//         if (!docId) {
//             setErrorMessage("Please enter a valid document ID.");
//             return;
//         }

//         try {
//             setLoading(true);
//             setErrorMessage("");

//             const details = await contract.methods.getDocument(web3.utils.padLeft(docId, 64)).call({ from: account });
//             if (!details.name || details.owner === "0x0000000000000000000000000000000000000000") {
//                 setErrorMessage("Document not found or access denied.");
//                 return;
//             }

//             setDocumentDetails({
//                 name: details.name,
//                 ipfsHash: details.ipfsHash,
//                 owner: details.owner,
//                 timestamp: new Date(parseInt(details.timestamp) * 1000).toLocaleString(),
//                 downloadUrl: `https://ipfs.io/ipfs/${details.ipfsHash}`,
//             });
//         } catch (error) {
//             console.error("Error viewing document:", error);
//             setErrorMessage("Error fetching document details.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div>
//             <h3>View Document</h3>
//             <input
//                 type="text"
//                 placeholder="Enter Document ID"
//                 value={docId}
//                 onChange={(e) => setDocId(e.target.value)}
//             />
//             <button onClick={handleView} disabled={loading}>
//                 {loading ? "Loading..." : "View Document"}
//             </button>
//             {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
//             {documentDetails && (
//                 <div>
//                     <h4>Document Details:</h4>
//                     <p>
//                         <strong>Name:</strong> {documentDetails.name}
//                     </p>
//                     <p>
//                         <strong>Owner:</strong> {documentDetails.owner}
//                     </p>
//                     <p>
//                         <strong>Timestamp:</strong> {documentDetails.timestamp}
//                     </p>
//                     <a
//                         href={documentDetails.downloadUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         download
//                     >
//                         <button>Download Document</button>
//                     </a>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ViewDocument;

import React, { useState } from "react";

const ViewDocument = ({ contract, web3, account }) => {
    const [docId, setDocId] = useState("");
    const [documentDetails, setDocumentDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleView = async () => {
        if (!docId) {
            setErrorMessage("Please enter a valid document ID.");
            setSuccessMessage("");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            const details = await contract.methods.getDocument(web3.utils.padLeft(docId, 64)).call({ from: account });
            if (!details.name || details.owner === "0x0000000000000000000000000000000000000000") {
                setErrorMessage("Document not found or access denied.");
                return;
            }

            // Construct the IPFS URL
            let ipfsUrl = details.ipfsHash;
            if (!ipfsUrl.startsWith("http")) {
                ipfsUrl = `https://ipfs.io/ipfs/${details.ipfsHash}`;
            }

            setDocumentDetails({
                name: details.name,
                ipfsHash: details.ipfsHash,
                owner: details.owner,
                timestamp: new Date(parseInt(details.timestamp) * 1000).toLocaleString(),
                ipfsUrl,
            });
        } catch (error) {
            console.error("Error viewing document:", error);
            setErrorMessage("Error fetching document details.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!documentDetails || !documentDetails.ipfsUrl) {
            setErrorMessage("No document to download.");
            setSuccessMessage("");
            return;
        }

        try {
            const response = await fetch(documentDetails.ipfsUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch the document.");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create an anchor element and trigger the download
            const a = document.createElement("a");
            a.href = url;
            a.download = documentDetails.name; // File name for the download
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);

            // Set success message
            setSuccessMessage("Document downloaded successfully!");
            setErrorMessage("");
        } catch (error) {
            console.error("Error during download:", error);
            setErrorMessage("Failed to download the document.");
            setSuccessMessage("");
        }
    };

    return (
        <div>
            <h3>View Document</h3>
            <input
                type="text"
                placeholder="Enter Document ID"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
            />
            <button onClick={handleView} disabled={loading}>
                {loading ? "Loading..." : "View Document"}
            </button>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            {documentDetails && (
                <div>
                    <h4>Document Details:</h4>
                    <p>
                        <strong>Name:</strong> {documentDetails.name}
                    </p>
                    <p>
                        <strong>Owner:</strong> {documentDetails.owner}
                    </p>
                    <p>
                        <strong>Timestamp:</strong> {documentDetails.timestamp}
                    </p>
                    <button onClick={handleDownload}>Download Document</button>
                </div>
            )}
        </div>
    );
};

export default ViewDocument;





