require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

async function main() {
    const web3 = new Web3(process.env.SCROLL_RPC_URL);
    const privateKey = process.env.PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    console.log("Deploying contract with account:", account.address);

    const contractPath = path.resolve(__dirname, "../artifacts/contracts/DocumentSharing.sol/DocumentSharing.json");
    const { abi, bytecode } = JSON.parse(fs.readFileSync(contractPath, "utf8"));

    const documentSharingContract = new web3.eth.Contract(abi);

    const deployedContract = await documentSharingContract.deploy({ data: bytecode }).send({
        from: account.address,
        gas: 3000000,
        gasPrice: await web3.eth.getGasPrice(),
    });

    console.log("DocumentSharing contract deployed at:", deployedContract.options.address);

    fs.writeFileSync("./contract-address.json", JSON.stringify({ address: deployedContract.options.address }, null, 2));
}

main().catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
});
