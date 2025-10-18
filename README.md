# 🔐 non-te-lo-dico

A decentralized application for uploading encrypted files to IPFS and managing access permissions using Fully Homomorphic Encryption (FHE) on Ethereum.

## 🌐 Live Demo

**🚀 The application is deployed and live at: [https://non-te-lo-dico.vercel.app/](https://non-te-lo-dico.vercel.app/)**

## 🚀 What is This?

This project demonstrates a privacy-preserving file storage system using:

- **FHEVM**: Fully Homomorphic Encryption on Ethereum for access control
- **IPFS**: Decentralized file storage via Pinata
- **Smart Contracts**: On-chain permission management
- **Next.js + React**: Modern frontend for seamless user experience

## ✨ Key Features

- **🔒 Secure File Upload**: Upload files to IPFS with encrypted access control
- **🔑 FHE Encryption**: Each file gets a unique encrypted ID that only authorized users can decrypt
- **👥 Permission Management**: Grant or revoke access to specific Ethereum addresses
- **🔍 File Retrieval**: Authorized users can view and decrypt file information
- **🌐 Sepolia Testnet**: Deployed and ready to use on Ethereum testnet

## 📋 Prerequisites

To use the live app, you only need:

- **MetaMask** browser extension
- **Sepolia ETH** (get from [Sepolia Faucet](https://sepoliafaucet.com/))

For local development:

- **Node.js** (v18 or higher)
- **pnpm** package manager

## 🛠️ Quick Start (Live App)

1. Visit [https://non-te-lo-dico.vercel.app/](https://non-te-lo-dico.vercel.app/)
2. Click "Connect Wallet" and select MetaMask
3. Switch to **Sepolia Testnet** in MetaMask
4. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
5. Start uploading and managing your encrypted files!

**Smart Contract Address**: `0xc907CC22B6cFB5a263D01eeA860E85cE9d03aDc9`

## 💻 Local Development

```bash
# Clone the repository
git clone <repository-url>
cd non-te-lo-dico

# Install dependencies
pnpm install

# Start the development server
pnpm start
```

## 📖 How to Use

### 1️⃣ Upload a Protected File

1. Select a file and click **"Upload to IPFS"**
2. Click **"Save to Blockchain"** to create an encrypted ID
3. Confirm the transaction in MetaMask

### 2️⃣ Manage Permissions

1. In **"My Files"**, find the file you want to share
2. Click **"Grant Access"** and enter the recipient's Ethereum address
3. Confirm the transaction to grant access
4. Use **"Revoke Access"** to remove permissions

### 3️⃣ Retrieve Files

1. Go to the **"Retrieve File"** page
2. Enter the file index (provided by the file owner)
3. Click **"Load File"** to view metadata
4. Click **"Decrypt ID"** to access the encrypted ID

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Wagmi, Viem, RainbowKit
- **Encryption**: FHEVM SDK by Zama
- **Storage**: IPFS via Pinata
- **Smart Contract**: Sepolia Testnet (`0xc907CC22B6cFB5a263D01eeA860E85cE9d03aDc9`)

## 📁 Project Structure

```
non-te-lo-dico/
├── packages/
│   ├── hardhat/                     # Smart contracts & deployment
│   ├── fhevm-sdk/                   # FHEVM SDK package
│   └── nextjs/                      # Next.js frontend application
└── scripts/                         # Utility scripts
```

## ❓ FAQ

### Are my files encrypted?

The file content is stored on IPFS. The **access control** uses FHE encryption - only authorized addresses can view and decrypt the file's ID.

### How much does it cost?

You only pay Ethereum gas fees for blockchain transactions. IPFS storage via Pinata has a free tier. Sepolia testnet transactions are free (only need test ETH).

### What happens if I lose access to my wallet?

You'll lose access to your files since permissions are tied to your Ethereum address. Always backup your wallet securely.

## 📚 Resources

- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/) - Complete FHEVM guide
- [Pinata Documentation](https://docs.pinata.cloud/) - IPFS storage guide

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for details.
