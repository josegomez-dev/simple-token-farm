/**
 * Local deployment script for the Simple Token Farm demo.
 * - Deploys LPToken and DAppToken
 * - Deploys TokenFarm with rewardPerBlock = 1 DAPP
 * - Transfers DAppToken ownership to the farm so it can mint on claim
 * - Mints 1000 LPT to alice and bob signers
 */
const { ethers } = require("hardhat");

async function main() {
  const [deployer, alice, bob] = await ethers.getSigners();

  // 1) Deploy LP y DAPP
  const LPToken = await ethers.getContractFactory("LPToken");
  const lp = await LPToken.deploy(deployer.address);
  await lp.waitForDeployment();

  const DAppToken = await ethers.getContractFactory("DAppToken");
  const dapp = await DAppToken.deploy(deployer.address);
  await dapp.waitForDeployment();

  // 2) Deploy Farm (reward inicial: 1e18)
  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const farm = await TokenFarm.deploy(await dapp.getAddress(), await lp.getAddress(), ethers.parseUnits("1", 18));
  await farm.waitForDeployment();

  console.log("LPToken:", await lp.getAddress());
  console.log("DAppToken:", await dapp.getAddress());
  console.log("TokenFarm:", await farm.getAddress());

  // 3) Transferir ownership del DAPP al Farm para poder mintear
  const txOwn = await dapp.transferOwnership(await farm.getAddress());
  await txOwn.wait();

  // 4) Mintear LPT para pruebas
  await (await lp.mint(alice.address, ethers.parseUnits("1000", 18))).wait();
  await (await lp.mint(bob.address, ethers.parseUnits("1000", 18))).wait();

  console.log("Ready.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


