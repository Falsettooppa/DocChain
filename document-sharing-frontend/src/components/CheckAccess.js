import React, { useState } from "react";

const CheckAccess = ({ contract }) => {
    const [docId, setDocId] = useState("");
    const [address, setAddress] = useState("");
    const [hasAccess, setHasAccess] = useState(null);

    const handleCheckAccess = async () => {
        if (!docId || !address) {
            alert("Please provide both Document ID and User Address.");
            return;
        }

        try {
            const access = await contract.methods.hasAccess(docId, address).call();
            setHasAccess(access);
        } catch (error) {
            console.error("Error checking access:", error);
            alert("Failed to check access.");
        }
    };

    return (
        <div>
            <h2>Check Document Access</h2>
            <input
                type="text"
                placeholder="Enter Document ID"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Enter User Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <button onClick={handleCheckAccess}>Check Access</button>
            {hasAccess !== null && (
                <p>{hasAccess ? "User has access" : "User does not have access"}</p>
            )}
        </div>
    );
};

export default CheckAccess;
