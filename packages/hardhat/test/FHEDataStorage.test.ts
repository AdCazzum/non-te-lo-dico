import { expect } from "chai";
import { ethers } from "hardhat";
import { FHEDataStorage } from "../types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FHEDataStorage", function () {
  let fheDataStorage: FHEDataStorage;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const FHEDataStorageFactory = await ethers.getContractFactory("FHEDataStorage");
    fheDataStorage = await FHEDataStorageFactory.deploy();
    await fheDataStorage.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await fheDataStorage.getAddress()).to.be.properAddress;
    });

    it("Should start with 0 total items", async function () {
      expect(await fheDataStorage.getTotalDataItems()).to.equal(0);
    });
  });

  describe("saveDataItem", function () {
    it("Should save a new data item", async function () {
      const ipfsUrl = "ipfs://QmTest123";
      
      await expect(fheDataStorage.connect(user1).saveDataItem(ipfsUrl))
        .to.emit(fheDataStorage, "DataStored");

      expect(await fheDataStorage.getTotalDataItems()).to.equal(1);
    });

    it("Should revert if IPFS URL is empty", async function () {
      await expect(
        fheDataStorage.connect(user1).saveDataItem("")
      ).to.be.revertedWith("IPFS URL cannot be empty");
    });

    it("Should return encrypted ID", async function () {
      const ipfsUrl = "ipfs://QmTest123";
      const tx = await fheDataStorage.connect(user1).saveDataItem(ipfsUrl);
      const receipt = await tx.wait();
      
      // L'encrypted ID dovrebbe essere restituito
      expect(receipt).to.not.be.null;
    });

    it("Should emit DataStored event with correct parameters", async function () {
      const ipfsUrl = "ipfs://QmTest123";
      
      const tx = await fheDataStorage.connect(user1).saveDataItem(ipfsUrl);
      const receipt = await tx.wait();
      
      const event = receipt?.logs.find(
        (log: any) => log.fragment?.name === "DataStored"
      );
      
      expect(event).to.not.be.undefined;
    });
  });

  describe("getMyDataIndices", function () {
    beforeEach(async function () {
      // User1 salva 2 items
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest1");
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest2");
      
      // User2 salva 1 item
      await fheDataStorage.connect(user2).saveDataItem("ipfs://QmTest3");
    });

    it("Should return correct indices for user1", async function () {
      const indices = await fheDataStorage.connect(user1).getMyDataIndices();
      expect(indices.length).to.equal(2);
      expect(indices[0]).to.equal(0);
      expect(indices[1]).to.equal(1);
    });

    it("Should return correct indices for user2", async function () {
      const indices = await fheDataStorage.connect(user2).getMyDataIndices();
      expect(indices.length).to.equal(1);
      expect(indices[0]).to.equal(2);
    });

    it("Should return empty array for user with no items", async function () {
      const indices = await fheDataStorage.connect(owner).getMyDataIndices();
      expect(indices.length).to.equal(0);
    });
  });

  describe("getDataIndicesByOwner", function () {
    beforeEach(async function () {
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest1");
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest2");
    });

    it("Should return indices for specified owner", async function () {
      const indices = await fheDataStorage.getDataIndicesByOwner(user1.address);
      expect(indices.length).to.equal(2);
    });

    it("Should revert if owner address is zero", async function () {
      await expect(
        fheDataStorage.getDataIndicesByOwner(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid owner address");
    });

    it("Should be callable by anyone", async function () {
      // User2 può vedere gli indici di User1
      const indices = await fheDataStorage.connect(user2).getDataIndicesByOwner(user1.address);
      expect(indices.length).to.equal(2);
    });
  });

  describe("getMyDataItem", function () {
    let itemIndex: number;

    beforeEach(async function () {
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest1");
      itemIndex = 0;
    });

    it("Should return data item details for owner", async function () {
      const item = await fheDataStorage.connect(user1).getMyDataItem(itemIndex);
      
      expect(item.owner).to.equal(user1.address);
      expect(item.ipfsUrl).to.equal("ipfs://QmTest1");
      expect(item.timestamp).to.be.gt(0);
    });

    it("Should revert if caller is not authorized", async function () {
      await expect(
        fheDataStorage.connect(user2).getMyDataItem(itemIndex)
      ).to.be.revertedWith("Access denied: caller is not authorized");
    });

    it("Should revert if item index is invalid", async function () {
      await expect(
        fheDataStorage.connect(user1).getMyDataItem(999)
      ).to.be.revertedWith("Invalid item index");
    });
  });

  describe("getDataItem", function () {
    let itemIndex: number;

    beforeEach(async function () {
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest1");
      itemIndex = 0;
    });

    it("Should return data item for authorized requester", async function () {
      const item = await fheDataStorage.getDataItem(itemIndex, user1.address);
      
      expect(item.owner).to.equal(user1.address);
      expect(item.ipfsUrl).to.equal("ipfs://QmTest1");
    });

    it("Should revert if requester is not authorized", async function () {
      await expect(
        fheDataStorage.getDataItem(itemIndex, user2.address)
      ).to.be.revertedWith("Access denied: caller is not authorized");
    });

    it("Should revert if requester address is zero", async function () {
      await expect(
        fheDataStorage.getDataItem(itemIndex, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid requester address");
    });
  });

  describe("grantItemAccess", function () {
    let itemIndex: number;

    beforeEach(async function () {
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest1");
      itemIndex = 0;
    });

    it("Should grant access to another user", async function () {
      await expect(
        fheDataStorage.connect(user1).grantItemAccess(itemIndex, user2.address)
      ).to.emit(fheDataStorage, "DataAccessGranted")
        .withArgs(itemIndex, user1.address, user2.address);
    });

    it("Should allow granted user to access data", async function () {
      await fheDataStorage.connect(user1).grantItemAccess(itemIndex, user2.address);
      
      const hasAccess = await fheDataStorage.hasItemAccess(itemIndex, user2.address);
      expect(hasAccess).to.be.true;
      
      // User2 dovrebbe poter accedere ai dati
      const item = await fheDataStorage.connect(user2).getMyDataItem(itemIndex);
      expect(item.ipfsUrl).to.equal("ipfs://QmTest1");
    });

    it("Should revert if not owner", async function () {
      await expect(
        fheDataStorage.connect(user2).grantItemAccess(itemIndex, owner.address)
      ).to.be.revertedWith("Only owner can grant access");
    });

    it("Should revert if requester is zero address", async function () {
      await expect(
        fheDataStorage.connect(user1).grantItemAccess(itemIndex, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid requester address");
    });

    it("Should revert if trying to grant access to self", async function () {
      await expect(
        fheDataStorage.connect(user1).grantItemAccess(itemIndex, user1.address)
      ).to.be.revertedWith("Cannot grant access to yourself");
    });

    it("Should revert if item index is invalid", async function () {
      await expect(
        fheDataStorage.connect(user1).grantItemAccess(999, user2.address)
      ).to.be.revertedWith("Invalid item index");
    });
  });

  describe("revokeItemAccess", function () {
    let itemIndex: number;

    beforeEach(async function () {
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest1");
      itemIndex = 0;
      await fheDataStorage.connect(user1).grantItemAccess(itemIndex, user2.address);
    });

    it("Should revoke access from user", async function () {
      await expect(
        fheDataStorage.connect(user1).revokeItemAccess(itemIndex, user2.address)
      ).to.emit(fheDataStorage, "DataAccessRevoked")
        .withArgs(itemIndex, user1.address, user2.address);
    });

    it("Should remove access after revoke", async function () {
      await fheDataStorage.connect(user1).revokeItemAccess(itemIndex, user2.address);
      
      const hasAccess = await fheDataStorage.hasItemAccess(itemIndex, user2.address);
      expect(hasAccess).to.be.false;
      
      // User2 non dovrebbe più poter accedere
      await expect(
        fheDataStorage.connect(user2).getMyDataItem(itemIndex)
      ).to.be.revertedWith("Access denied: caller is not authorized");
    });

    it("Should revert if not owner", async function () {
      await expect(
        fheDataStorage.connect(user2).revokeItemAccess(itemIndex, owner.address)
      ).to.be.revertedWith("Only owner can revoke access");
    });

    it("Should revert if requester is zero address", async function () {
      await expect(
        fheDataStorage.connect(user1).revokeItemAccess(itemIndex, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid requester address");
    });
  });

  describe("hasItemAccess", function () {
    let itemIndex: number;

    beforeEach(async function () {
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest1");
      itemIndex = 0;
    });

    it("Should return true for owner", async function () {
      const hasAccess = await fheDataStorage.hasItemAccess(itemIndex, user1.address);
      expect(hasAccess).to.be.true;
    });

    it("Should return false for non-authorized user", async function () {
      const hasAccess = await fheDataStorage.hasItemAccess(itemIndex, user2.address);
      expect(hasAccess).to.be.false;
    });

    it("Should return true for granted user", async function () {
      await fheDataStorage.connect(user1).grantItemAccess(itemIndex, user2.address);
      
      const hasAccess = await fheDataStorage.hasItemAccess(itemIndex, user2.address);
      expect(hasAccess).to.be.true;
    });

    it("Should revert if item index is invalid", async function () {
      await expect(
        fheDataStorage.hasItemAccess(999, user1.address)
      ).to.be.revertedWith("Invalid item index");
    });

    it("Should revert if requester is zero address", async function () {
      await expect(
        fheDataStorage.hasItemAccess(itemIndex, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid requester address");
    });
  });

  describe("Multiple items workflow", function () {
    it("Should handle multiple items from multiple users", async function () {
      // User1 salva 3 items
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmUser1Item1");
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmUser1Item2");
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmUser1Item3");
      
      // User2 salva 2 items
      await fheDataStorage.connect(user2).saveDataItem("ipfs://QmUser2Item1");
      await fheDataStorage.connect(user2).saveDataItem("ipfs://QmUser2Item2");
      
      // Verifica totali
      expect(await fheDataStorage.getTotalDataItems()).to.equal(5);
      
      // Verifica indici user1
      const user1Indices = await fheDataStorage.connect(user1).getMyDataIndices();
      expect(user1Indices.length).to.equal(3);
      
      // Verifica indici user2
      const user2Indices = await fheDataStorage.connect(user2).getMyDataIndices();
      expect(user2Indices.length).to.equal(2);
    });

    it("Should handle access grant and revoke cycle", async function () {
      await fheDataStorage.connect(user1).saveDataItem("ipfs://QmTest1");
      const itemIndex = 0;
      
      // Inizialmente user2 non ha accesso
      expect(await fheDataStorage.hasItemAccess(itemIndex, user2.address)).to.be.false;
      
      // Concedi accesso
      await fheDataStorage.connect(user1).grantItemAccess(itemIndex, user2.address);
      expect(await fheDataStorage.hasItemAccess(itemIndex, user2.address)).to.be.true;
      
      // Revoca accesso
      await fheDataStorage.connect(user1).revokeItemAccess(itemIndex, user2.address);
      expect(await fheDataStorage.hasItemAccess(itemIndex, user2.address)).to.be.false;
    });
  });
});
