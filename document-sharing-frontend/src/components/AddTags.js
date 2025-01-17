import React, { useState } from "react";

const AddTags = ({ contract, web3, account }) => {
    const [docId, setDocId] = useState("");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleAddTags = async () => {
        if (!docId || !tags) {
            setErrorMessage("Please provide Document ID and at least one tag.");
            setSuccessMessage("");
            return;
        }

        const tagArray = tags
            .split(",")
            .map((tag) => tag.trim().toLowerCase()) // Normalize tags for consistency
            .filter((tag) => tag !== ""); // Remove empty tags

        if (tagArray.length === 0) {
            setErrorMessage("Please enter valid tags.");
            setSuccessMessage("");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            const formattedDocId = web3.utils.padLeft(docId, 64); // Ensure docId is properly formatted

            await contract.methods.addTags(formattedDocId, tagArray).send({ from: account });
            setSuccessMessage("Tags added successfully!");
            setDocId("");
            setTags("");
        } catch (error) {
            console.error("Error adding tags:", error);
            setErrorMessage("Failed to add tags. Ensure you're the document owner.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Add Tags to Document</h2>
            <input
                type="text"
                placeholder="Enter Document ID"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Enter tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
            />
            <button onClick={handleAddTags} disabled={loading}>
                {loading ? "Adding..." : "Add Tags"}
            </button>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        </div>
    );
};

export default AddTags;
