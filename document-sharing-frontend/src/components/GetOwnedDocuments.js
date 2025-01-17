import React, { useState, useEffect } from "react";

const GetOwnedDocuments = ({ contract, account }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const docIds = await contract.methods.getDocumentsByOwner(account).call();
                setDocuments(docIds);
            } catch (error) {
                console.error("Error fetching documents:", error);
                alert("Failed to fetch owned documents.");
            } finally {
                setLoading(false);
            }
        };

        if (account && contract) {
            fetchDocuments();
        }
    }, [contract, account]);

    return (
        <div>
            <h2>Your Documents</h2>
            {loading ? (
                <p>Loading...</p>
            ) : documents.length > 0 ? (
                <ul>
                    {documents.map((docId, index) => (
                        <li key={index}>{docId}</li>
                    ))}
                </ul>
            ) : (
                <p>No documents found.</p>
            )}
        </div>
    );
};

export default GetOwnedDocuments;
// import React, { useState, useEffect } from "react";

// const GetOwnedDocuments = ({ contract, account }) => {
//     const [documents, setDocuments] = useState([]);
//     const [selectedDocId, setSelectedDocId] = useState("");
//     const [documentDetails, setDocumentDetails] = useState(null);
//     const [loadingDocs, setLoadingDocs] = useState(true);
//     const [loadingDetails, setLoadingDetails] = useState(false);
//     const [errorMessage, setErrorMessage] = useState("");

//     // Fetch all document IDs owned by the user
//     useEffect(() => {
//         const fetchDocuments = async () => {
//             try {
//                 const docIds = await contract.methods.getDocumentsByOwner(account).call();
//                 setDocuments(docIds);
//             } catch (error) {
//                 console.error("Error fetching documents:", error);
//                 setErrorMessage("Failed to fetch owned documents.");
//             } finally {
//                 setLoadingDocs(false);
//             }
//         };

//         if (account && contract) {
//             fetchDocuments();
//         }
//     }, [contract, account]);

//     // Fetch detailed information for a selected document
//     const fetchDocumentDetails = async (docId) => {
//         try {
//             setLoadingDetails(true);
//             setSelectedDocId(docId);

//             const details = await contract.methods.getDocument(docId).call();
//             setDocumentDetails({
//                 docId: docId,
//                 name: details[0],
//                 ipfsHash: details[1],
//                 owner: details[2],
//                 sharedWithArray: details[3],
//                 tags: details[4],
//             });
//         } catch (error) {
//             console.error("Error fetching document details:", error);
//             setErrorMessage("Failed to fetch document details.");
//         } finally {
//             setLoadingDetails(false);
//         }
//     };

//     return (
//         <div>
//             <h2>Your Documents</h2>
//             {loadingDocs ? (
//                 <p>Loading your documents...</p>
//             ) : documents.length > 0 ? (
//                 <ul>
//                     {documents.map((docId, index) => (
//                         <li key={index}>
//                             <button
//                                 onClick={() => fetchDocumentDetails(docId)}
//                                 disabled={loadingDetails && selectedDocId === docId}
//                             >
//                                 {loadingDetails && selectedDocId === docId
//                                     ? "Loading..."
//                                     : `View Details for Doc ID: ${docId}`}
//                             </button>
//                         </li>
//                     ))}
//                 </ul>
//             ) : (
//                 <p>No documents found.</p>
//             )}

//             {documentDetails && (
//                 <div>
//                     <h3>Document Details</h3>
//                     <p><strong>Document ID:</strong> {documentDetails.docId}</p>
//                     <p><strong>Name:</strong> {documentDetails.name}</p>
//                     <p>
//                         <strong>IPFS Hash:</strong>{" "}
//                         <a href={`https://ipfs.io/ipfs/${documentDetails.ipfsHash}`} target="_blank" rel="noopener noreferrer">
//                             {documentDetails.ipfsHash}
//                         </a>
//                     </p>
//                     <p><strong>Owner:</strong> {documentDetails.owner}</p>
//                     <p>
//                         <strong>Tags:</strong>{" "}
//                         {documentDetails.tags && documentDetails.tags.length > 0
//                             ? documentDetails.tags.join(", ")
//                             : "No tags"}
//                     </p>
//                     <p>
//                         <strong>Shared With:</strong>{" "}
//                         {documentDetails.sharedWithArray && documentDetails.sharedWithArray.length > 0
//                             ? documentDetails.sharedWithArray.join(", ")
//                             : "No one"}
//                     </p>
//                 </div>
//             )}
//             {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
//         </div>
//     );
// };

// export default GetOwnedDocuments;

