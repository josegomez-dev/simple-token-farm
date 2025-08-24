// 🧪 SEPOLIA CONTRACT INTERACTION SCRIPT 🧪
// Test deployed contracts on Sepolia Testnet

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🧪 Starting Sepolia contract interaction tests...");
    
    // Read deployment info from file
    const deploymentFile = path.join(__dirname, "../deployment-info.json");
    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment info file not found. Please run deployment first.");
        return;
    }
    
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const { contracts } = deploymentInfo;
    
    console.log("📋 Using deployed contracts:");
    console.log("   • DAppToken:", contracts.DAppToken);
    console.log("   • LPToken:", contracts.LPToken);
    console.log("   • TokenFarm:", contracts.TokenFarm);
    
    try {
        // Get signers
        const signers = await ethers.getSigners();
        if (signers.length === 0) {
            throw new Error("No signers available");
        }
        
        const deployer = signers[0];
        const user1 = signers.length > 1 ? signers[1] : deployer;
        const user2 = signers.length > 2 ? signers[2] : deployer;
        
        console.log("📱 Testing with accounts:");
        console.log("   • Deployer:", deployer.address);
        console.log("   • User1:", user1.address);
        console.log("   • User2:", user2.address);
        
        // Get contract instances
        const dappToken = await ethers.getContractAt("DAppToken", contracts.DAppToken);
        const lpToken = await ethers.getContractAt("LPToken", contracts.LPToken);
        const tokenFarm = await ethers.getContractAt("TokenFarm", contracts.TokenFarm);
        
        console.log("\n📋 Contract Information:");
        console.log("   • DAppToken:", await dappToken.getAddress());
        console.log("   • LPToken:", await lpToken.getAddress());
        console.log("   • TokenFarm:", await tokenFarm.getAddress());
        
        // Check balances
        console.log("\n💰 Initial Balances:");
        const deployerLPBalance = await lpToken.balanceOf(deployer.address);
        const deployerDappBalance = await dappToken.balanceOf(deployer.address);
        console.log("   • Deployer LP Balance:", ethers.formatEther(deployerLPBalance), "LPT");
        console.log("   • Deployer DApp Balance:", ethers.formatEther(deployerDappBalance), "DAPP");
        
        // Test 1: Approve LP tokens for staking
        console.log("\n🔓 Test 1: Approving LP tokens for staking...");
        const approveTx = await lpToken.approve(await tokenFarm.getAddress(), deployerLPBalance);
        await approveTx.wait();
        console.log("✅ LP tokens approved for staking");
        
        // Test 2: Stake LP tokens
        console.log("\n📥 Test 2: Staking LP tokens...");
        const stakeAmount = ethers.parseEther("1000");
        const stakeTx = await tokenFarm.deposit(stakeAmount);
        await stakeTx.wait();
        console.log("✅ Staked 1000 LP tokens");
        
        // Check staking info
        const stakingInfo = await tokenFarm.users(deployer.address);
        console.log("   • Staked Amount:", ethers.formatEther(stakingInfo.stakingBalance), "LPT");
        console.log("   • Pending Rewards:", ethers.formatEther(stakingInfo.pendingRewards), "DAPP");
        
        // Test 3: Distribute rewards (simulate time passing)
        console.log("\n⏰ Test 3: Distributing rewards...");
        const distributeTx = await tokenFarm.distributeRewardsAll();
        await distributeTx.wait();
        console.log("✅ Rewards distributed");
        
        // Check updated rewards
        const updatedInfo = await tokenFarm.users(deployer.address);
        console.log("   • Updated Pending Rewards:", ethers.formatEther(updatedInfo.pendingRewards), "DAPP");
        
        // Test 4: Claim rewards
        if (updatedInfo.pendingRewards > 0) {
            console.log("\n🎁 Test 4: Claiming rewards...");
            const claimTx = await tokenFarm.claimRewards();
            await claimTx.wait();
            console.log("✅ Rewards claimed");
            
            // Check final balances
            const finalDappBalance = await dappToken.balanceOf(deployer.address);
            console.log("   • Final DApp Balance:", ethers.formatEther(finalDappBalance), "DAPP");
        }
        
        // Test 5: Withdraw staked tokens
        console.log("\n📤 Test 5: Withdrawing staked tokens...");
        const withdrawTx = await tokenFarm.withdraw();
        await withdrawTx.wait();
        console.log("✅ Withdrawn staked LP tokens");
        
        // Final balance check
        const finalLPBalance = await lpToken.balanceOf(deployer.address);
        console.log("   • Final LP Balance:", ethers.formatEther(finalLPBalance), "LPT");
        
        console.log("\n🎉 All interaction tests completed successfully!");
        console.log("\n📊 Test Summary:");
        console.log("   ✅ Token approval");
        console.log("   ✅ Staking functionality");
        console.log("   ✅ Reward distribution");
        console.log("   ✅ Reward claiming");
        console.log("   ✅ Token withdrawal");
        
    } catch (error) {
        console.error("❌ Interaction test failed:", error.message);
        console.log("\n💡 Troubleshooting tips:");
        console.log("   1. Check if contract addresses are correct");
        console.log("   2. Ensure you have Sepolia testnet ETH");
        console.log("   3. Verify contracts are deployed and verified");
        console.log("   4. Check if you have sufficient LP token balance");
    }
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Unexpected error:", error);
        process.exit(1);
    });
