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

    const jwt = process.env.REACT_APP_PINATA_JWT;
    if (!jwt) {
        throw new Error("Pinata JWT is missing. Check your frontend .env file.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pinataMetadata", JSON.stringify({ name: file.name }));
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    try {
        console.log("Uploading file to Pinata...");

        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                maxBodyLength: Infinity,
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            }
        );

        const ipfsHash = response.data.IpfsHash;
        const ipfsURL = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        console.log("File uploaded to IPFS:", ipfsURL);

        return ipfsURL;
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        throw new Error("Failed to upload file to Pinata.");
    }
};