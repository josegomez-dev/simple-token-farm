/**
 * Unit tests for the Simple Token Farm.
 * Scenarios covered:
 *  - Deposit flow and accounting
 *  - Proportional distribution and claim
 *  - Withdraw returns LP and preserves pending rewards
 *  - Claim fee and owner fee withdrawal
 *  - Reward per block reconfiguration within bounds
 */
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

/**
 * Mines `n` empty blocks quickly on Hardhat Network.
 * @param {number} n Number of blocks to mine
 */
async function mineN(n) {
  await network.provider.send("hardhat_mine", ["0x" + n.toString(16)]);
}

describe("Simple Token Farm", function () {
  let deployer, alice, bob;
  let lp, dapp, farm;

  const toWei = (v) => ethers.parseUnits(v.toString(), 18);

  beforeEach(async () => {
    [deployer, alice, bob] = await ethers.getSigners();

    const LPToken = await ethers.getContractFactory("LPToken");
    lp = await LPToken.deploy(deployer.address);
    await lp.waitForDeployment();

    const DAppToken = await ethers.getContractFactory("DAppToken");
    dapp = await DAppToken.deploy(deployer.address);
    await dapp.waitForDeployment();

    const TokenFarm = await ethers.getContractFactory("TokenFarm");
    farm = await TokenFarm.deploy(await dapp.getAddress(), await lp.getAddress(), toWei(1)); // 1 DAPP por bloque
    await farm.waitForDeployment();

    // Farm será owner del DAPP
    await (await dapp.transferOwnership(await farm.getAddress())).wait();

    // Minteamos LP a Alice y Bob
    await (await lp.mint(alice.address, toWei(1000))).wait();
    await (await lp.mint(bob.address, toWei(1000))).wait();
  });

  it("Mint LP y deposit", async () => {
    await (await lp.connect(alice).approve(await farm.getAddress(), toWei(200))).wait();
    await (await farm.connect(alice).deposit(toWei(200))).wait();

    const u = await farm.users(alice.address);
    expect(u.stakingBalance).to.equal(toWei(200));
    expect(await farm.totalStakingBalance()).to.equal(toWei(200));
  });

  it("Distribuye recompensas proporcionalmente y claim de Alice", async () => {
    // Alice 100, Bob 300 => total 400
    await (await lp.connect(alice).approve(await farm.getAddress(), toWei(100))).wait();
    await (await farm.connect(alice).deposit(toWei(100))).wait();

    await (await lp.connect(bob).approve(await farm.getAddress(), toWei(300))).wait();
    await (await farm.connect(bob).deposit(toWei(300))).wait();

    // minar 10 bloques
    await mineN(10);

    // owner llama a distributeRewardsAll()
    await (await farm.distributeRewardsAll()).wait();

    // share Alice 25% => 2.5 DAPP, Bob 75% => 7.5 DAPP
    const pendingA = await farm.getPendingRewards(alice.address);
    const pendingB = await farm.getPendingRewards(bob.address);
    expect(pendingA).to.equal(toWei(2.5));
    expect(pendingB).to.equal(toWei(7.5));

    // Claim Alice sin fee
    const balBefore = await dapp.balanceOf(alice.address);
    await (await farm.connect(alice).claimRewards()).wait();
    const balAfter = await dapp.balanceOf(alice.address);

    expect(balAfter - balBefore).to.equal(toWei(2.5));
    expect(await farm.getPendingRewards(alice.address)).to.equal(0n);
  });

  it("Withdraw devuelve LPT y deja recompensas pendientes reclamables", async () => {
    await (await lp.connect(alice).approve(await farm.getAddress(), toWei(100))).wait();
    await (await farm.connect(alice).deposit(toWei(100))).wait();

    await mineN(5);
    await (await farm.distributeRewardsAll()).wait();

    // Alice retira LPT
    const lptBefore = await lp.balanceOf(alice.address);
    await (await farm.connect(alice).withdraw()).wait();
    const lptAfter = await lp.balanceOf(alice.address);

    expect(lptAfter - lptBefore).to.equal(toWei(100));

    // Aún puede hacer claim de lo pendiente
    const pending = await farm.getPendingRewards(alice.address);
    expect(pending).to.be.gt(0n);

    const dappBefore = await dapp.balanceOf(alice.address);
    await (await farm.connect(alice).claimRewards()).wait();
    const dappAfter = await dapp.balanceOf(alice.address);
    expect(dappAfter - dappBefore).to.equal(pending);
  });

  it("Fee en claim y retiro de fees por el owner", async () => {
    await (await lp.connect(alice).approve(await farm.getAddress(), toWei(100))).wait();
    await (await farm.connect(alice).deposit(toWei(100))).wait();
    await mineN(10);
    await (await farm.distributeRewardsAll()).wait();

    // set fee 5% y que el fee se mintee a este contrato (feeRecipient = 0)
    await (await farm.setClaimFee(500, ethers.ZeroAddress)).wait();

    const pending = await farm.getPendingRewards(alice.address); // ~10 DAPP (porque ella es 100% del pool)
    const expectedFee = pending * 500n / 10000n;
    const expectedNet = pending - expectedFee;

    const beforeUser = await dapp.balanceOf(alice.address);
    const beforeFarm = await dapp.balanceOf(await farm.getAddress());

    await (await farm.connect(alice).claimRewards()).wait();

    const afterUser = await dapp.balanceOf(alice.address);
    const afterFarm = await dapp.balanceOf(await farm.getAddress());

    expect(afterUser - beforeUser).to.equal(expectedNet);
    expect(afterFarm - beforeFarm).to.equal(expectedFee);

    // Owner retira fees a su cuenta
    const ownerBefore = await dapp.balanceOf(await deployer.getAddress());
    await (await farm.withdrawFees(expectedFee, await deployer.getAddress())).wait();
    const ownerAfter = await dapp.balanceOf(await deployer.getAddress());
    expect(ownerAfter - ownerBefore).to.equal(expectedFee);
  });

  it("Cambia rewardPorBloque dentro del rango (Bonus 4)", async () => {
    // Abrimos rango y luego actualizamos reward
    await (await farm.setRewardRange(toWei(0.5), toWei(5))).wait();
    await (await farm.setRewardPerBlock(toWei(2))).wait();

    await (await lp.connect(alice).approve(await farm.getAddress(), toWei(100))).wait();
    await (await farm.connect(alice).deposit(toWei(100))).wait();

    await mineN(5);
    await (await farm.distributeRewardsAll()).wait();

    // 5 bloques * 2 DAPP/bloque * 100% share = 10 DAPP
    const pending = await farm.getPendingRewards(alice.address);
    expect(pending).to.equal(toWei(10));
  });
});


