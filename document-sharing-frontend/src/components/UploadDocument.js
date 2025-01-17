import React, { useState } from "react";
import { uploadToPinata } from "../utils/pinata";

const UploadDocument = ({ contract, account }) => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [ipfsUrl, setIpfsUrl] = useState(""); // Store IPFS URL
    const [docId, setDocId] = useState(""); // Store Document ID

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const uploadDocument = async () => {
        if (!name || !file) {
            alert("Please provide both a name and a file.");
            return;
        }

        try {
            setUploading(true);
            setMessage("Uploading file to IPFS...");

            // Upload the file to Pinata
            const ipfsURL = await uploadToPinata(file);
            setIpfsUrl(ipfsURL);

            setMessage("Saving document to blockchain...");

            // Call the smart contract to save the document
            const receipt = await contract.methods.uploadDocument(name, ipfsURL).send({ from: account });

            // Parse the emitted event to get `docId`
            const event = receipt.events.DocumentUploaded;
            if (event) {
                const emittedDocId = event.returnValues.docId;
                setDocId(emittedDocId);

                setMessage("Document uploaded successfully!");
                console.log("IPFS URL:", ipfsURL);
                console.log("Document ID:", emittedDocId); // Use this `docId` for future interactions
            } else {
                setMessage("Failed to retrieve Document ID from the blockchain.");
                console.error("No event emitted in transaction receipt.");
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            setMessage("Failed to upload document. Check the console for details.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <h3>Upload Document</h3>
            <input
                type="text"
                placeholder="Enter document name"
                value={name}
                onChange={handleNameChange}
                disabled={uploading}
            />
            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
            />
            <button onClick={uploadDocument} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Document"}
            </button>
            {message && <p>{message}</p>}
            {ipfsUrl && (
                <div>
                    <h4>Document Details:</h4>
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Document ID:</strong> {docId}</p>
                    <p><strong>IPFS URL:</strong> <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">View</a></p>
                </div>
            )}
        </div>
    );
};

export default UploadDocument;
// import React, { useState } from "react";

// const UploadDocument = ({ web3, contract, account }) => {
//     const [loading, setLoading] = useState(false);
//     const [status, setStatus] = useState("");

//     const uploadToIPFS = async (file) => {
//         try {
//             const formData = new FormData();
//             formData.append("file", file);

//             const response = await fetch("https://ipfs.infura.io:5001/api/v0/add", {
//                 method: "POST",
//                 body: formData,
//                 headers: {
//                     Authorization: `Basic ${Buffer.from("YOUR_INFURA_PROJECT_ID" + ":" + "YOUR_INFURA_PROJECT_SECRET").toString("base64")}`,
//                 },
//             });

//             const data = await response.json();
//             if (data && data.Hash) {
//                 return data.Hash; // Returning the IPFS hash
//             } else {
//                 throw new Error("Failed to upload to IPFS.");
//             }
//         } catch (error) {
//             console.error("Error uploading to IPFS:", error);
//             throw error;
//         }
//     };

//     const uploadDocumentToBlockchain = async (ipfsHash) => {
//         try {
//             setStatus("Uploading to blockchain...");
//             const result = await contract.methods.uploadDocument(ipfsHash).send({ from: account });
//             if (result && result.events && result.events.DocumentUploaded) {
//                 const documentId = result.events.DocumentUploaded.returnValues.documentId;
//                 setStatus(`Document uploaded successfully! Document ID: ${documentId}`);
//             } else {
//                 throw new Error("Failed to upload document to blockchain.");
//             }
//         } catch (error) {
//             setStatus(`Blockchain upload failed: ${error.message}`);
//         }
//     };

//     const handleFileUpload = async (event) => {
//         setLoading(true);
//         setStatus("Uploading document to IPFS...");

//         try {
//             const file = event.target.files[0];
//             const ipfsHash = await uploadToIPFS(file);
//             await uploadDocumentToBlockchain(ipfsHash);
//         } catch (error) {
//             setStatus(`Error: ${error.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div>
//             <h3>Upload Document</h3>
//             <input type="file" onChange={handleFileUpload} />
//             {loading && <p>Loading...</p>}
//             {status && <p>{status}</p>}
//         </div>
//     );
// };

// export default UploadDocument;
