# ChainVault

ChainVault is a decentralised document collaboration and access control platform built with blockchain technology. It enables users to securely upload documents to IPFS, register document references on-chain, verify ownership, and share access with specific wallet addresses.

## Problem

Traditional document sharing systems are mostly centralised. This creates challenges around trust, ownership verification, access transparency, and document integrity. Users often depend on a central service to control access and maintain records.

## Solution

ChainVault provides a blockchain-based approach to document collaboration. Documents are uploaded through IPFS, while ownership and sharing permissions are managed on-chain through a smart contract. This improves transparency, trust, and accountability in document exchange.

## Features

- Secure document upload through IPFS
- On-chain ownership verification
- Permission-based document sharing
- Shared With Me dashboard
- Activity log for document actions
- Tag-based organisation and search
- Access checking for document recipients
- Owner document listing

## Tech Stack

- React
- Solidity
- Web3.js
- Hardhat
- Scroll Sepolia
- IPFS
- Pinata

## How It Works

1. User connects MetaMask wallet
2. User uploads a document to IPFS
3. The IPFS reference is registered on-chain
4. The owner can share the document with another wallet
5. Shared users can view documents they have access to
6. Activity logs provide visibility into key document actions

## Core Modules

### Upload Document
Allows users to upload files and store their IPFS links on-chain.

### View Document
Retrieves document details using the generated document ID.

### Share Document
Allows the owner to share document access with another wallet address.

### Shared With Me
Displays documents that have been shared with the connected account.

### Activity Log
Shows key blockchain activity such as uploads, sharing, and deletions.

### Add Tags and Search
Supports basic tagging and searching of owned documents.

## Smart Contract

The project uses a Solidity smart contract to handle:

- document registration
- ownership tracking
- permission-based sharing
- access validation
- document deletion
- tagging support

## Network

ChainVault is deployed on **Scroll Sepolia** for testing and demonstration.

## Setup Instructions

### Clone the repository
```bash
git clone https://github.com/Falsettooppa/ChainVault.git
cd ChainVault
Install smart contract dependencies
npm install
Install frontend dependencies
cd document-sharing-frontend
npm install
Configure environment variables
Root .env
PRIVATE_KEY=your_private_key
RPC_URL=https://sepolia-rpc.scroll.io
Frontend .env
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_PINATA_JWT=your_pinata_jwt
Run the frontend
cd document-sharing-frontend
npm start
Deploy the smart contract
npx hardhat run scripts/deploy.js --network scrollSepolia
Use Cases
academic certificate verification
legal document sharing
secure business collaboration
digital record management
trusted cross-party document exchange
Project Vision

ChainVault is designed to make document collaboration more transparent, secure, and verifiable by combining decentralised storage with blockchain-based access control.

Demo Flow
Connect wallet
Upload document
View document
Share document
Open Shared With Me
Review Activity Log
License

MIT