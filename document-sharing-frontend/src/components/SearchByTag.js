import React, { useState } from "react";

const SearchByTag = ({ contract, account }) => {
    const [tag, setTag] = useState("");
    const [documentIds, setDocumentIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSearch = async () => {
        if (!tag) {
            setErrorMessage("Please enter a tag to search.");
            setDocumentIds([]);
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            const normalizedTag = tag.trim().toLowerCase(); // Normalize the tag input

            const docIds = await contract.methods.searchByTag(normalizedTag).call({ from: account });
            const filteredDocIds = docIds.filter(
                (id) => id !== "0x0000000000000000000000000000000000000000000000000000000000000000"
            );

            if (filteredDocIds.length === 0) {
                setErrorMessage("No documents found for the given tag.");
            } else {
                setDocumentIds(filteredDocIds);
            }
        } catch (error) {
            console.error("Error searching by tag:", error);
            setErrorMessage("Failed to search documents by tag.");
            setDocumentIds([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Search Documents by Tag</h2>
            <input
                type="text"
                placeholder="Enter tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
            />
            <button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
            </button>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {documentIds.length > 0 && (
                <div>
                    <h3>Results:</h3>
                    <ul>
                        {documentIds.map((docId, index) => (
                            <li key={index}>{docId}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchByTag;
