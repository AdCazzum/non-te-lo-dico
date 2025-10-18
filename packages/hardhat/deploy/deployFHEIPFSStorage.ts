import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFHEIPFSStorage: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying FHEIPFSStorage with account:", deployer);

  await deploy("FHEIPFSStorage", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("FHEIPFSStorage deployed successfully");
};

export default deployFHEIPFSStorage;
deployFHEIPFSStorage.tags = ["FHEIPFSStorage"];
