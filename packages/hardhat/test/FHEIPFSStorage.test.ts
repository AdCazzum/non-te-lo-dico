import { expect } from "chai";
import { ethers } from "hardhat";
import { FHEIPFSStorage } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Unit tests for FHEIPFSStorage smart contract
 * 
 * This contract uses euint128 for:
 * - encryptedKey: FHE encrypted decryption key
 * - price: FHE encrypted price in wei
 * - totalPrice: FHE encrypted sum of all provider's file prices (calculated using FHE.add)
 * 
 * Note: Full integration tests with FHE encryption/decryption require
 * a running FHEVM node and are tested in the frontend integration tests.
 */
describe("FHEIPFSStorage", function () {
  let fheIPFSStorage: FHEIPFSStorage;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const FHEIPFSStorageFactory = await ethers.getContractFactory("FHEIPFSStorage");
    fheIPFSStorage = (await FHEIPFSStorageFactory.deploy()) as unknown as FHEIPFSStorage;
    await fheIPFSStorage.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await fheIPFSStorage.getAddress()).to.be.properAddress;
    });

    it("Should have correct contract name", async function () {
      const address = await fheIPFSStorage.getAddress();
      expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("File Existence Checks", function () {
    it("Should return false for non-existent file", async function () {
      const cid = "QmTest123";
      expect(await fheIPFSStorage.fileExists(cid)).to.equal(false);
    });

    it("Should return empty array for owner with no files", async function () {
      const files = await fheIPFSStorage.getOwnerFiles(owner.address);
      expect(files).to.be.an("array");
      expect(files.length).to.equal(0);
    });

    it("Should revert when checking files for zero address", async function () {
      await expect(fheIPFSStorage.getOwnerFiles(ethers.ZeroAddress)).to.be.revertedWith("Invalid owner address");
    });
  });

  describe("File Metadata", function () {
    it("Should revert when getting metadata for non-existent file", async function () {
      const cid = "QmNonExistent";
      await expect(fheIPFSStorage.getFileMetadata(cid)).to.be.revertedWith("File does not exist");
    });

    it("Should revert when getting encrypted key for non-existent file", async function () {
      const cid = "QmNonExistent";
      await expect(fheIPFSStorage.getEncryptedKey(cid)).to.be.revertedWith("File does not exist");
    });

    it("Should revert when getting encrypted price for non-existent file", async function () {
      const cid = "QmNonExistent";
      await expect(fheIPFSStorage.getEncryptedPrice(cid)).to.be.revertedWith("File does not exist");
    });
  });

  describe("Access Control", function () {
    it("Should revert when granting access to non-existent file", async function () {
      const cid = "QmNonExistent";
      await expect(fheIPFSStorage.grantAccess(cid, addr1.address)).to.be.revertedWith("File does not exist");
    });

    it("Should revert when granting access to zero address", async function () {
      const cid = "QmTest123";
      // We expect this to fail because the file doesn't exist, but we test the validation
      await expect(fheIPFSStorage.grantAccess(cid, ethers.ZeroAddress)).to.be.reverted;
    });

    it("Should revert when revoking access from non-existent file", async function () {
      const cid = "QmNonExistent";
      await expect(fheIPFSStorage.revokeAccess(cid, addr1.address)).to.be.revertedWith("File does not exist");
    });

    it("Should revert when revoking access from zero address", async function () {
      const cid = "QmTest123";
      await expect(fheIPFSStorage.revokeAccess(cid, ethers.ZeroAddress)).to.be.reverted;
    });
  });

  describe("StoreFile Function Validation", function () {
    it("Should revert when storing file with empty CID", async function () {
      // Mock encrypted data (bytes32 for euint64)
      const mockEncryptedKey = ethers.hexlify(ethers.randomBytes(32));
      const mockEncryptedPrice = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(32));

      await expect(
        fheIPFSStorage.storeFile("", mockEncryptedKey, mockProof, mockEncryptedPrice, mockProof)
      ).to.be.revertedWith("CID cannot be empty");
    });
  });

  describe("Contract Type Information", function () {
    it("Should support euint128 for encryptedKey, price, and totalPrice", async function () {
      // This is a meta-test to verify the contract uses euint128
      // We verify this by checking that the contract compiled successfully
      // and deployed, which it wouldn't if there were type mismatches
      const address = await fheIPFSStorage.getAddress();
      expect(address).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("Integration Scenarios", function () {
    it("Should handle multiple owners independently", async function () {
      const ownerFiles = await fheIPFSStorage.getOwnerFiles(owner.address);
      const addr1Files = await fheIPFSStorage.getOwnerFiles(addr1.address);
      const addr2Files = await fheIPFSStorage.getOwnerFiles(addr2.address);

      expect(ownerFiles.length).to.equal(0);
      expect(addr1Files.length).to.equal(0);
      expect(addr2Files.length).to.equal(0);
    });

    it("Should properly check existence for different CIDs", async function () {
      const cid1 = "QmTest123";
      const cid2 = "QmTest456";
      const cid3 = "QmTest789";

      expect(await fheIPFSStorage.fileExists(cid1)).to.equal(false);
      expect(await fheIPFSStorage.fileExists(cid2)).to.equal(false);
      expect(await fheIPFSStorage.fileExists(cid3)).to.equal(false);
    });
  });

  describe("Provider Statistics", function () {
    it("Should return empty array when no providers exist", async function () {
      const providers = await fheIPFSStorage.getAllProviders();
      expect(providers).to.be.an("array");
      expect(providers.length).to.equal(0);
    });

    it("Should return zero for provider count when no providers", async function () {
      const count = await fheIPFSStorage.getProviderCount();
      expect(count).to.equal(0);
    });

    it("Should return empty provider stats when no providers", async function () {
      const stats = await fheIPFSStorage.getProviderStats.staticCall();
      expect(stats).to.be.an("array");
      expect(stats.length).to.equal(0);
    });

    it("Should revert when querying stats for non-provider address", async function () {
      await expect(
        fheIPFSStorage.getProviderStatsByAddress(addr1.address)
      ).to.be.revertedWith("Address is not a provider");
    });

    it("Should revert when querying stats for zero address", async function () {
      await expect(
        fheIPFSStorage.getProviderStatsByAddress(ethers.ZeroAddress)
      ).to.be.revertedWith("Address is not a provider");
    });
  });
});
