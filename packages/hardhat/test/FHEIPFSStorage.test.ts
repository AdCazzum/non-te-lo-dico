import { expect } from "chai";
import { ethers } from "hardhat";
import { FHEIPFSStorage } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

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
  });

  describe("File Operations", function () {
    it("Should check if file exists", async function () {
      const cid = "QmTest123";
      expect(await fheIPFSStorage.fileExists(cid)).to.equal(false);
    });

    it("Should get owner files", async function () {
      const files = await fheIPFSStorage.getOwnerFiles(owner.address);
      expect(files).to.be.an("array");
      expect(files.length).to.equal(0);
    });
  });
});
