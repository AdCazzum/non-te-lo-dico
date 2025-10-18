# 🔐 FHE Data Storage

A decentralized application for uploading encrypted files to IPFS and managing access permissions using Fully Homomorphic Encryption (FHE) on Ethereum.

## 🚀 What is This?

This project demonstrates how to build a privacy-preserving file storage system using:
- **FHEVM**: Fully Homomorphic Encryption on Ethereum for access control
- **IPFS**: Decentralized file storage via Pinata
- **Smart Contracts**: On-chain permission management
- **React + Next.js**: Modern frontend for seamless user experience

## ✨ Key Features

- **� Secure File Upload**: Upload files to IPFS with encrypted access control
- **🔑 FHE Encryption**: Each file gets a unique encrypted ID that only authorized users can decrypt
- **👥 Permission Management**: Grant or revoke access to specific Ethereum addresses
- **🔍 File Retrieval**: Authorized users can view and decrypt file information
- **🎨 Modern UI**: Clean, responsive interface with Tailwind CSS
- **🔗 RainbowKit**: Easy wallet connection and management
- **🌐 Sepolia Testnet**: Deployed and ready to use on Ethereum testnet

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **MetaMask** browser extension
- **Pinata Account** (free at [pinata.cloud](https://pinata.cloud))
- **Sepolia ETH** (get from [Sepolia Faucet](https://sepoliafaucet.com/))

## 📋 Prerequinextjss

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **MetaMask** browser extension
- **Git** for cloning the repository

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd fhevm-react-template

# Initialize submodules (includes fhevm-hardhat-template)
git submodule update --init --recursive

# Install dependencies
pnpm install
```

### 2. Environment Configuration

#### Pinata Setup (Required for IPFS uploads)

1. Create a free account at [pinata.cloud](https://pinata.cloud)
2. Go to **Developers** → **API Keys**
3. Create a new API key with pinning permissions
4. Copy your API Key and API Secret

#### Configure Environment Variables

```bash
# Create .env.local file
cp packages/nextjs/.env.example packages/nextjs/.env.local

# Edit .env.local and add your Pinata credentials:
NEXT_PUBLIC_PINATA_API_KEY="your_api_key_here"
NEXT_PUBLIC_PINATA_SECRET_KEY="your_secret_key_here"
```

#### Verify Setup

```bash
# Run the verification script
./scripts/verify-setup.sh
```

### 3. Start the Application

The smart contract is already deployed on Sepolia testnet! Just start the frontend:

```bash
# Start the Next.js frontend
cd packages/nextjs
pnpm dev

# Or from root:
pnpm start
```

### 4. Connect to Sepolia Testnet

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Connect Wallet" and select MetaMask
3. Switch to **Sepolia Testnet** in MetaMask
4. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

**Smart Contract Address**: `0xc907CC22B6cFB5a263D01eeA860E85cE9d03aDc9`

## 📖 How to Use

### 1️⃣ Upload a Protected File

1. Click **"Select File"** and choose a file from your computer
2. Click **"Upload to IPFS"** - your file will be uploaded to Pinata
3. Click **"Save to Blockchain"** - this creates an encrypted ID and saves the reference
4. Confirm the transaction in MetaMask

### 2️⃣ Manage Permissions

1. In **"My Files"**, find the file you want to share
2. Click **"Grant Access"**
3. Enter the Ethereum address of the person you want to share with
4. Click **"Confirm Grant"** and approve the transaction
5. To revoke access, click **"Revoke Access"** instead

### 3️⃣ Retrieve Files

1. Go to the **"Retrieve File"** page or section
2. Enter the file index (get this from the file owner)
3. Click **"Load File"** - you'll see metadata and IPFS URL
4. Click **"Decrypt ID"** to reveal the encrypted ID
5. The decrypted ID is your access key!

For detailed instructions, see [FHE_DATA_STORAGE_GUIDE.md](./FHE_DATA_STORAGE_GUIDE.md)

## 🏗️ Architecture

### Smart Contract
- **Name**: `FHEDataStorage.sol`
- **Network**: Sepolia Testnet
- **Address**: `0xc907CC22B6cFB5a263D01eeA860E85cE9d03aDc9`
- **Features**:
  - IPFS URL storage
  - FHE-encrypted ID generation
  - Access permission management
  - Event emissions for tracking

### Frontend Components
- **`FileUpload.tsx`**: Upload files to IPFS and blockchain
- **`FileManager.tsx`**: View files and manage permissions
- **`FileRetrieval.tsx`**: Retrieve and decrypt files
- **`useFHEDataStorage.tsx`**: Custom hook for contract interaction

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, DaisyUI
- **Blockchain**: Wagmi, Viem, RainbowKit
- **Encryption**: FHEVM SDK by Zama
- **Storage**: IPFS via Pinata

## ⚠️ Production Notes

- In production, `NEXT_PUBLIC_ALCHEMY_API_KEY` must be set (see `packages/nextjs/scaffold.config.ts`)
- Ensure `packages/nextjs/contracts/deployedContracts.ts` points to your contract addresses
- Optional: set `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` for better WalletConnect reliability
- Optional: add per-chain RPCs via `rpcOverrides` in `packages/nextjs/scaffold.config.ts`
- **Important**: Consider implementing client-side file encryption before IPFS upload for complete privacy

## 🔧 Troubleshooting

### Common MetaMask + Hardhat Issues

When developing with MetaMask and Hardhat, you may encounter these common issues:

#### ❌ Nonce Mismatch Error

**Problem**: MetaMask tracks transaction nonces, but when you restart Hardhat, the node resets while MetaMask doesn't update its tracking.

**Solution**:
1. Open MetaMask extension
2. Select the Hardhat network
3. Go to **Settings** → **Advanced**
4. Click **"Clear Activity Tab"** (red button)
5. This resets MetaMask's nonce tracking

#### ❌ Cached View Function Results

**Problem**: MetaMask caches smart contract view function results. After restarting Hardhat, you may see outdated data.

**Solution**:
1. **Restart your entire browser** (not just refresh the page)
2. MetaMask's cache is stored in extension memory and requires a full browser restart to clear

> 💡 **Pro Tip**: Always restart your browser after restarting Hardhat to avoid cache issues.

For more details, see the [MetaMask development guide](https://docs.metamask.io/wallet/how-to/run-devnet/).

## 📁 Project Structure

```
non-te-lo-dico/
├── packages/
│   ├── hardhat/                     # Smart contracts & deployment
│   │   ├── contracts/
│   │   │   └── FHEDataStorage.sol   # Main storage contract
│   │   └── deployments/sepolia/     # Deployed contract info
│   ├── fhevm-sdk/                   # FHEVM SDK package
│   └── nextjs/                      # React frontend application
│       ├── app/
│       │   ├── _components/         # UI components
│       │   │   ├── FHEDataStorageDemo.tsx
│       │   │   ├── FileUpload.tsx
│       │   │   ├── FileManager.tsx
│       │   │   ├── FileRetrieval.tsx
│       │   │   └── InfoPanel.tsx
│       │   ├── retrieve/            # Retrieval page
│       │   └── page.tsx             # Home page
│       └── hooks/
│           └── fhedatastorage/      # Contract hooks
│               └── useFHEDataStorage.tsx
├── scripts/
│   └── verify-setup.sh              # Setup verification script
├── FHE_DATA_STORAGE_GUIDE.md        # Detailed user guide
└── IMPLEMENTATION.md                # Technical implementation details
```

## ❓ FAQ

### Q: Do I need to deploy the smart contract?
**A**: No! The contract is already deployed on Sepolia at `0xc907CC22B6cFB5a263D01eeA860E85cE9d03aDc9`. Just configure Pinata and start using it.

### Q: Are my files encrypted?
**A**: The file content itself is stored on IPFS as-is. The **access control** uses FHE encryption - only authorized addresses can view and decrypt the file's ID. For complete privacy, implement client-side encryption before uploading.

### Q: How much does it cost?
**A**: You only pay Ethereum gas fees for blockchain transactions (saveDataItem, grantAccess, revokeAccess). IPFS storage via Pinata has a free tier. Use Sepolia testnet for free testing.

### Q: Can I use this on mainnet?
**A**: The contract would need to be deployed on a mainnet that supports FHEVM (currently limited). This demo is designed for Sepolia testnet.

### Q: What happens if I lose access to my wallet?
**A**: You'll lose access to your files since permissions are tied to your Ethereum address. Always backup your wallet securely.

### Q: How do I know someone has granted me access?
**A**: Check the blockchain events or try to retrieve the file using its index. The contract will tell you if you have access.

## 📚 Additional Resources

### Official Documentation
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/) - Complete FHEVM guide
- [FHEVM Hardhat Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat) - Hardhat integration
- [Relayer SDK Documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/) - SDK reference
- [Environment Setup](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional) - MNEMONIC & API keys

### Development Tools
- [MetaMask + Hardhat Setup](https://docs.metamask.io/wallet/how-to/run-devnet/) - Local development
- [React Documentation](https://reactjs.org/) - React framework guide

### Community & Support
- [FHEVM Discord](https://discord.com/invite/zama) - Community support
- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues) - Bug reports & feature requests

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for details.
