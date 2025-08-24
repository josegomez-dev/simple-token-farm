// 🌟 SEPOLIA AUTO-GAS DEPLOYMENT SCRIPT 🌟
// Deploy Simple Token Farm to Sepolia Testnet with automatic gas estimation

const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting auto-gas deployment to Sepolia Testnet...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📱 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    
    // Check if we have enough balance
    const balance = await deployer.provider.getBalance(deployer.address);
    if (balance < ethers.parseEther("0.002")) {
        throw new Error("❌ Insufficient balance. Need at least 0.002 ETH for deployment.");
    }
    
    try {
        // Get current gas price from network
        const currentGasPrice = await deployer.provider.getFeeData();
        const gasPrice = currentGasPrice.gasPrice || ethers.parseUnits("5", "gwei"); // Use 5 gwei as fallback
        
        console.log("⛽ Using gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
        
        // 1. Deploy DAppToken (Reward Token) - requires initialOwner parameter
        console.log("\n📦 Deploying DAppToken...");
        const DAppToken = await ethers.getContractFactory("DAppToken");
        const dappToken = await DAppToken.deploy(deployer.address, {
            gasPrice: gasPrice
            // No gasLimit - let Hardhat estimate automatically
        });
        await dappToken.waitForDeployment();
        const dappTokenAddress = await dappToken.getAddress();
        console.log("✅ DAppToken deployed to:", dappTokenAddress);
        
        // 2. Deploy LPToken (Staking Token) - requires initialOwner parameter
        console.log("\n📦 Deploying LPToken...");
        const LPToken = await ethers.getContractFactory("LPToken");
        const lpToken = await LPToken.deploy(deployer.address, {
            gasPrice: gasPrice
            // No gasLimit - let Hardhat estimate automatically
        });
        await lpToken.waitForDeployment();
        const lpTokenAddress = await lpToken.getAddress();
        console.log("✅ LPToken deployed to:", lpTokenAddress);
        
        // 3. Deploy TokenFarm - requires dappToken, lpToken, and initialRewardPerBlock
        console.log("\n📦 Deploying TokenFarm...");
        const TokenFarm = await ethers.getContractFactory("TokenFarm");
        const initialRewardPerBlock = 1; // 1 DAPP per block
        const tokenFarm = await TokenFarm.deploy(dappTokenAddress, lpTokenAddress, initialRewardPerBlock, {
            gasPrice: gasPrice
            // No gasLimit - let Hardhat estimate automatically
        });
        await tokenFarm.waitForDeployment();
        const tokenFarmAddress = await tokenFarm.getAddress();
        console.log("✅ TokenFarm deployed to:", tokenFarmAddress);
        
        // 4. Transfer DAppToken ownership to TokenFarm
        console.log("\n🔄 Transferring DAppToken ownership to TokenFarm...");
        const transferTx = await dappToken.transferOwnership(tokenFarmAddress, {
            gasPrice: gasPrice
        });
        await transferTx.wait();
        console.log("✅ DAppToken ownership transferred to TokenFarm");
        
        // 5. Mint initial LP tokens for testing
        console.log("\n🪙 Minting initial LP tokens for testing...");
        const mintTx = await lpToken.mint(deployer.address, ethers.parseEther("10000"), {
            gasPrice: gasPrice
        });
        await mintTx.wait();
        console.log("✅ 10,000 LP tokens minted to deployer");
        
        // 6. Verify contract ownership
        console.log("\n🔍 Verifying contract setup...");
        const farmOwner = await tokenFarm.owner();
        const dappOwner = await dappToken.owner();
        const lpBalance = await lpToken.balanceOf(deployer.address);
        
        console.log("📋 Contract Setup Summary:");
        console.log("   • TokenFarm Owner:", farmOwner);
        console.log("   • DAppToken Owner:", dappOwner);
        console.log("   • Deployer LP Balance:", ethers.formatEther(lpBalance), "LPT");
        console.log("   • Initial Reward Per Block:", initialRewardPerBlock, "DAPP");
        
        // 7. Save deployment info
        const deploymentInfo = {
            network: "Sepolia Testnet",
            deployer: deployer.address,
            contracts: {
                DAppToken: dappTokenAddress,
                LPToken: lpTokenAddress,
                TokenFarm: tokenFarmAddress
            },
            parameters: {
                initialRewardPerBlock: initialRewardPerBlock
            },
            gasInfo: {
                gasPrice: ethers.formatUnits(gasPrice, "gwei") + " gwei",
                method: "Automatic gas estimation"
            },
            timestamp: new Date().toISOString(),
            chainId: Number(await deployer.provider.getNetwork().then(net => net.chainId))
        };
        
        console.log("\n📄 Deployment Information:");
        console.log(JSON.stringify(deploymentInfo, null, 2));
        
        // Save deployment info to file for automatic verification
        const fs = require("fs");
        const path = require("path");
        const deploymentFile = path.join(__dirname, "../deployment-info.json");
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to deployment-info.json");
        
        // 8. Instructions for next steps
        console.log("\n🎯 Next Steps:");
        console.log("1. 🌐 View contracts on Sepolia Etherscan:");
        console.log(`   • DAppToken: https://sepolia.etherscan.io/address/${dappTokenAddress}`);
        console.log(`   • LPToken: https://sepolia.etherscan.io/address/${lpTokenAddress}`);
        console.log(`   • TokenFarm: https://sepolia.etherscan.io/address/${tokenFarmAddress}`);
        
        console.log("\n2. 🔍 Verify contracts on Etherscan:");
        console.log("   • Use the automatic verification: npm run verify:sepolia:auto");
        
        console.log("\n3. 🧪 Test the contracts:");
        console.log("   • Use Sepolia testnet ETH for transactions");
        console.log("   • Test staking, rewards, and claiming");
        
        console.log("\n4. 📱 Update frontend with new addresses");
        
        console.log("\n🎉 Deployment completed successfully!");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Gas cost analysis:");
            console.log("   • Your balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
            console.log("   • Try getting more Sepolia ETH from: https://sepoliafaucet.com/");
        }
        
        process.exit(1);
    }
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Unexpected error:", error);
        process.exit(1);
    });
