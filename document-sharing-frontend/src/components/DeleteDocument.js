import React, { useState } from "react";

const DeleteDocument = ({ contract, account }) => {
    const [docId, setDocId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!docId) {
            alert("Please provide a valid Document ID.");
            return;
        }

        try {
            setLoading(true);
            await contract.methods.deleteDocument(docId).send({ from: account });
            alert("Document deleted successfully!");
            setDocId("");
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Failed to delete document. Ensure you're the owner.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Delete Document</h2>
            <input
                type="text"
                placeholder="Enter Document ID"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
            />
            <button onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete Document"}
            </button>
        </div>
    );
};

export default DeleteDocument;
