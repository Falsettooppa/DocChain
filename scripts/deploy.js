require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

async function main() {
<<<<<<< HEAD
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY.startsWith("0x")
        ? process.env.PRIVATE_KEY
        : `0x${process.env.PRIVATE_KEY}`;

    if (!rpcUrl) {
        throw new Error("RPC_URL is missing in .env");
    }

    if (!process.env.PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY is missing in .env");
    }

    const web3 = new Web3(rpcUrl);

=======
    const web3 = new Web3(process.env.SCROLL_RPC_URL);
    const privateKey = process.env.PRIVATE_KEY;
>>>>>>> 5790e3a492a910629bcb14e998bb9842d8a17463
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    console.log("Deploying contract with account:", account.address);

<<<<<<< HEAD
    const contractPath = path.resolve(
        __dirname,
        "../artifacts/contracts/DocumentSharing.sol/DocumentSharing.json"
    );

=======
    const contractPath = path.resolve(__dirname, "../artifacts/contracts/DocumentSharing.sol/DocumentSharing.json");
>>>>>>> 5790e3a492a910629bcb14e998bb9842d8a17463
    const { abi, bytecode } = JSON.parse(fs.readFileSync(contractPath, "utf8"));

    const documentSharingContract = new web3.eth.Contract(abi);

<<<<<<< HEAD
    const gasPrice = await web3.eth.getGasPrice();

    const deployedContract = await documentSharingContract
        .deploy({ data: bytecode })
        .send({
            from: account.address,
            gas: 3000000,
            gasPrice,
        });

    console.log("DocumentSharing contract deployed at:", deployedContract.options.address);

    fs.writeFileSync(
        path.resolve(__dirname, "../contract-address.json"),
        JSON.stringify({ address: deployedContract.options.address }, null, 2)
    );
=======
    const deployedContract = await documentSharingContract.deploy({ data: bytecode }).send({
        from: account.address,
        gas: 3000000,
        gasPrice: await web3.eth.getGasPrice(),
    });

    console.log("DocumentSharing contract deployed at:", deployedContract.options.address);

    fs.writeFileSync("./contract-address.json", JSON.stringify({ address: deployedContract.options.address }, null, 2));
>>>>>>> 5790e3a492a910629bcb14e998bb9842d8a17463
}

main().catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
<<<<<<< HEAD
});
=======
});
>>>>>>> 5790e3a492a910629bcb14e998bb9842d8a17463
