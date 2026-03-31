import React, { useState } from "react";

const ShareDocument = ({ contract, web3, account }) => {
    const [docId, setDocId] = useState("");
    const [recipient, setRecipient] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleShare = async () => {
        if (!docId || !recipient) {
            setErrorMessage("Please provide both the Document ID and the Recipient Address.");
            setSuccessMessage("");
            return;
        }

        // Validate the recipient address
        if (!web3.utils.isAddress(recipient)) {
            setErrorMessage("Invalid recipient address. Ensure it's a valid Ethereum address.");
            setSuccessMessage("");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            // Format the Document ID to a 32-byte hexadecimal string
            const formattedDocId = web3.utils.padLeft(docId, 64);

            // Send the transaction to share the document
            await contract.methods
                .shareDocument(formattedDocId, recipient)
                .send({ from: account });

            setSuccessMessage("Document shared successfully!");
            setDocId(""); // Clear Document ID input field
            setRecipient(""); // Clear Recipient Address input field
        } catch (error) {
            console.error("Error sharing document:", error);

            if (error.message.includes("Access denied")) {
                setErrorMessage("You don't have permission to share this document.");
            } else if (error.message.includes("Document does not exist")) {
                setErrorMessage("The specified document does not exist. Verify the Document ID.");
            } else {
                setErrorMessage("An error occurred while sharing the document. Please try again.");
            }
            setSuccessMessage("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <h3>Share Document</h3>
            <input
                type="text"
                placeholder="Document ID"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                className="input-field"
            />
            <input
                type="text"
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="input-field"
            />
            <button onClick={handleShare} disabled={loading} className="action-button">
                {loading ? "Sharing..." : "Share"}
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
        </div>
    );
};

export default ShareDocument;
