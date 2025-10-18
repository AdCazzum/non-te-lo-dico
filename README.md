# 🔐 non-te-lo-dico

[![Sepolia](https://img.shields.io/badge/Sepolia-Deployed-success?logo=ethereum)](https://sepolia.etherscan.io/address/0x896a6d6Bd3781E2C36Fe1a46c1d83A05f8EB0F2F)
[![Contract](https://img.shields.io/badge/Contract-Verified-blue?logo=ethereum)](https://sepolia.etherscan.io/address/0x896a6d6Bd3781E2C36Fe1a46c1d83A05f8EB0F2F#code)
[![FHE](https://img.shields.io/badge/FHE-euint128-purple)](https://docs.zama.ai/)
[![License](https://img.shields.io/badge/License-BSD--3--Clause--Clear-orange)](LICENSE)

A decentralized application for uploading encrypted AI training datasets to IPFS and managing access permissions using Fully Homomorphic Encryption (FHE) on Ethereum.

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
- **📊 Provider Statistics**: View anonymous statistics about data providers
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

### 📜 Smart Contract Information

**Deployment Information**
- **Contract Address**: `0x896a6d6Bd3781E2C36Fe1a46c1d83A05f8EB0F2F`
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Verified on Etherscan**: [View Contract](https://sepolia.etherscan.io/address/0x896a6d6Bd3781E2C36Fe1a46c1d83A05f8EB0F2F#code)

**Features**:
- 🔐 Encrypted decryption keys using ZAMA FHE (`euint128`)
- 💰 Encrypted dataset prices (`euint128`)
- 🔑 ACL-based access control
- 📊 On-chain metadata storage
- 👥 Provider statistics tracking
- 🔍 Anonymous provider list with file counts
- ➕ FHE arithmetic operations - on-chain encrypted price summation using `FHE.add()`

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

## 📋 Smart Contract Features

### Key Features

The smart contract provides advanced encryption and privacy features:

#### **euint128 Support**
- Uses `euint128` for encrypted values (128-bit FHE integers)
- **Price Range**: 0 to ~340 undecillion wei (more than enough for any practical use case)
- **FHE Arithmetic**: Supports on-chain encrypted operations using `FHE.add()` for price summation
- **Optimal Balance**: 128-bit provides excellent security while enabling efficient encrypted computations

#### **Encrypted Dataset Pricing**
```solidity
struct FileData {
    string cid;              // IPFS CID of the encrypted file
    euint128 encryptedKey;   // Encrypted decryption key (FHE)
    euint128 price;          // Encrypted price in wei (FHE)
    address owner;           // File owner address
    uint256 timestamp;       // Creation timestamp
}
```

#### **Provider Statistics with FHE**
```solidity
struct ProviderStats {
    address providerAddress;
    uint256 fileCount;
    euint128 totalPrice;  // Encrypted sum of all file prices (calculated using FHE.add)
}
```

The smart contract calculates encrypted total prices on-chain:
```solidity
// Sum encrypted prices while maintaining encryption
totalPrice = files[0].price;
for (uint256 i = 1; i < fileCount; i++) {
    totalPrice = FHE.add(totalPrice, files[i].price);
}
```

#### **Access Control**
```

#### **Access Control**
- Owner-only grant/revoke permissions
- ZAMA ACL system for FHE encryption
- Separate permissions for decryption keys and prices
- On-chain event tracking

#### **Security Features**
- ✅ Immutable file storage (no modifications after upload)
- ✅ Unique CID enforcement (prevents duplicates)
- ✅ Full encryption for sensitive data
- ✅ Verified contract code on Etherscan

## 📖 How to Use

### 1️⃣ Upload a Protected Dataset

1. Select your dataset file
2. **Set a price in ETH** for your dataset
3. Click **"Encrypt & Upload to IPFS"**
4. Confirm the transaction to store on blockchain
5. Your encryption key and price are fully encrypted on-chain!

### 2️⃣ Grant Access to Trusted Parties

1. After uploading, enter a trusted party's **Ethereum address**
2. Click **"Grant Decryption Access"**
3. Confirm the transaction - they can now access both the key and price
4. Share the secure access link with them

**What gets shared**:
- ✅ Encrypted decryption key (only decryptable by authorized addresses)
- ✅ Encrypted price (only decryptable by authorized addresses)
- ✅ IPFS CID and metadata

### 3️⃣ Retrieve and Decrypt Datasets

1. Go to the **"Retrieve Dataset"** page
2. Enter the **CID** or use a shared link
3. Connect your wallet
4. Click **"Check Access"** - if authorized, you'll see:
   - ✅ Owner information
   - ✅ Upload timestamp
   - ✅ **Decrypted price in ETH**
   - ✅ Decrypted encryption key
5. Download and decrypt the dataset locally

### 4️⃣ View Data Provider Statistics

1. Go to the **"Data Providers"** page
2. Connect your wallet
3. View anonymous statistics about all providers:
   - 📊 Total number of providers
   - 📁 Number of datasets per provider
   - 🔒 All provider identities are anonymized (e.g., "Provider #1", "Provider #2")
   - 🔐 Encrypted prices protected by FHE technology

**Privacy Features**:
- ✅ Provider addresses are never revealed
- ✅ Only aggregate statistics are shown
- ✅ Maintains complete transparency without compromising privacy

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Wagmi, Viem, RainbowKit
- **Encryption**: FHEVM SDK by Zama (euint256)
- **Storage**: IPFS via Pinata
- **Smart Contract**: FHEIPFSStorage on Sepolia
  - Address: `0x896a6d6Bd3781E2C36Fe1a46c1d83A05f8EB0F2F`
  - Encryption: 128-bit FHE integers (euint128) for keys and prices
  - Price Support: Practical unlimited range with FHE arithmetic
  - Provider Statistics: Track anonymous provider activity with encrypted totals

## 📁 Project Structure

```
non-te-lo-dico/
├── packages/
│   ├── hardhat/                     # Smart contracts & deployment
│   │   ├── contracts/
│   │   │   └── FHEIPFSStorage.sol  # Main contract (euint256)
│   │   ├── deploy/
│   │   │   └── deployFHEIPFSStorage.ts
│   │   ├── test/
│   │   │   └── FHEIPFSStorage.test.ts
│   │   └── deployments/
│   │       └── sepolia/             # Deployment info
│   ├── fhevm-sdk/                   # FHEVM SDK package
│   └── nextjs/                      # Next.js frontend application
│       ├── app/
│       │   ├── upload/              # Upload page
│       │   ├── retrieve/            # Retrieve page
│       │   └── data-providers/      # NEW: Provider stats page
│       ├── contracts/
│       │   └── deployedContracts.ts # Contract ABIs
│       └── hooks/
│           ├── useFHEIPFSStorage.ts # Contract interaction hook
│           └── useDataProviders.ts  # NEW: Provider stats hook
└── scripts/                         # Utility scripts
    └── generateTsAbis.ts           # ABI generator
```

## 👨‍💻 For Developers

### Contract Deployment

```bash
# Navigate to hardhat package
cd packages/hardhat

# Deploy to Sepolia
npx hardhat deploy --network sepolia --tags FHEIPFSStorage

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Regenerate Frontend ABIs

```bash
# From project root
npx tsx scripts/generateTsAbis.ts
```

### Contract Functions

```solidity
// Store file with encrypted key and price
function storeFile(
    string calldata _cid,
    externalEuint256 _encryptedKey,
    bytes calldata _inputProof,
    externalEuint256 _encryptedPrice,
    bytes calldata _priceInputProof
) external

// Grant access to key and price
function grantAccess(string calldata _cid, address _grantee) external

// Get encrypted values (ACL protected)
function getEncryptedKey(string calldata _cid) external view returns (euint256)
function getEncryptedPrice(string calldata _cid) external view returns (euint256)

// Provider statistics
function getAllProviders() external view returns (address[] memory)
function getProviderCount() external view returns (uint256)
function getProviderStats() external returns (ProviderStats[] memory)
function getProviderStatsByAddress(address _provider) external view returns (uint256 fileCount, string[] memory cids)
```

### Frontend Integration

```typescript
import { useFHEIPFSStorage } from "~/hooks/useFHEIPFSStorage";

// In your component
const storage = useFHEIPFSStorage(fhevmInstance);

// Store file with price (price in wei as bigint)
await storage.storeFile(cid, encryptionKey, priceInWei);

// Get encrypted price
const encryptedPriceHandle = await storage.getEncryptedPrice(cid);

// Decrypt with FHEVM
const decryptedPrice = await decrypt(encryptedPriceHandle);
```

## ❓ FAQ

### Are my files encrypted?

Yes! Files are encrypted client-side before uploading to IPFS. The **decryption keys** are encrypted with ZAMA's FHE and stored on-chain, ensuring only authorized addresses can decrypt them.

### What about dataset pricing?

- You can set any price when uploading a dataset (unlimited range)
- The price is **fully encrypted** on-chain using FHE (`euint256`)
- Only authorized users can view the decrypted price
- Perfect for data marketplaces and AI training datasets

### How much does it cost to use?

- **Gas Fees**: Only pay for blockchain transactions on Sepolia (free with test ETH)
- **IPFS Storage**: Free tier available via Pinata
- **Dataset Price**: Set your own price for datasets (visible only to authorized users)

### What happens if I lose access to my wallet?

You'll lose access to your files since permissions are tied to your Ethereum address. Always:
- ✅ Backup your wallet seed phrase securely
- ✅ Consider using hardware wallets for production
- ✅ Test recovery procedures on testnet first

### Can I modify a file after uploading?

No. Files are immutable once stored on-chain. This ensures:
- ✅ Data integrity
- ✅ Audit trails
- ✅ No tampering with prices or permissions

### What's the maximum price I can set?

With `euint256`, you can set **unlimited prices** for your datasets. This provides maximum flexibility for any pricing scenario.

## 📚 Resources

- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/) - Complete FHEVM guide
- [Pinata Documentation](https://docs.pinata.cloud/) - IPFS storage guide
- [Hardhat Documentation](https://hardhat.org/) - Smart contract development
- [Wagmi Documentation](https://wagmi.sh/) - React hooks for Ethereum

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors

- **@mramundo** - Initial work and smart contract development
- **Community Contributors** - See [contributors](../../graphs/contributors)

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) - For the amazing FHEVM technology
- [Pinata](https://www.pinata.cloud/) - For IPFS infrastructure
- [Scaffold-ETH 2](https://scaffoldeth.io/) - For the development framework

## �📄 License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using ZAMA FHE and IPFS**
```
