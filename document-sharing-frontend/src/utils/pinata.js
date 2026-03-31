import axios from "axios";

/**
 * Uploads a file to Pinata IPFS.
 * @param {File} file - The file to upload.
 * @returns {Promise<string>} - The IPFS URL of the uploaded file.
 */
export const uploadToPinata = async (file) => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }

    // Prepare the FormData to send the file
    const formData = new FormData();
    formData.append("file", file);

    try {
        console.log("Uploading file to Pinata...");

        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
                    pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
                },
            }
        );

        // Extract the IPFS hash from the response
        const ipfsHash = response.data.IpfsHash;
        const ipfsURL = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        console.log("File uploaded to IPFS:", ipfsURL);

        return ipfsURL; // Return the IPFS URL
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        throw new Error("Failed to upload file to Pinata.");
    }
};
