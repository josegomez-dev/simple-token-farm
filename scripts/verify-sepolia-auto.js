// 🔍 SEPOLIA AUTOMATIC CONTRACT VERIFICATION SCRIPT 🔍
// Automatically verify deployed contracts on Sepolia Etherscan
// This script reads deployment info and verifies all contracts

const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Starting automatic contract verification on Sepolia...");
    
    try {
        // Try to read deployment info from a file (you can create this manually after deployment)
        let deploymentInfo = null;
        const deploymentFile = path.join(__dirname, "../deployment-info.json");
        
        if (fs.existsSync(deploymentFile)) {
            try {
                deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
                console.log("📄 Found deployment info file");
            } catch (error) {
                console.log("⚠️  Could not parse deployment info file");
            }
        }
        
        if (!deploymentInfo) {
            console.log("❌ No deployment info found. Please run deployment first or create deployment-info.json manually.");
            console.log("\n💡 Create a file called 'deployment-info.json' with this structure:");
            console.log(JSON.stringify({
                deployer: "YOUR_DEPLOYER_ADDRESS",
                contracts: {
                    DAppToken: "YOUR_DAPP_TOKEN_ADDRESS",
                    LPToken: "YOUR_LP_TOKEN_ADDRESS",
                    TokenFarm: "YOUR_TOKEN_FARM_ADDRESS"
                }
            }, null, 2));
            return;
        }
        
        const { deployer, contracts } = deploymentInfo;
        
        if (!contracts.DAppToken || !contracts.LPToken || !contracts.TokenFarm) {
            throw new Error("❌ Missing contract addresses in deployment info");
        }
        
        console.log("📋 Using deployment info:");
        console.log("   • Deployer:", deployer);
        console.log("   • DAppToken:", contracts.DAppToken);
        console.log("   • LPToken:", contracts.LPToken);
        console.log("   • TokenFarm:", contracts.TokenFarm);
        
        // 1. Verify DAppToken
        console.log("\n📦 Verifying DAppToken...");
        await run("verify:verify", {
            address: contracts.DAppToken,
            constructorArguments: [deployer],
            contract: "contracts/DAppToken.sol:DAppToken"
        });
        console.log("✅ DAppToken verified successfully!");
        
        // 2. Verify LPToken
        console.log("\n📦 Verifying LPToken...");
        await run("verify:verify", {
            address: contracts.LPToken,
            constructorArguments: [deployer],
            contract: "contracts/LPToken.sol:LPToken"
        });
        console.log("✅ LPToken verified successfully!");
        
        // 3. Verify TokenFarm
        console.log("\n📦 Verifying TokenFarm...");
        await run("verify:verify", {
            address: contracts.TokenFarm,
            constructorArguments: [contracts.DAppToken, contracts.LPToken, 1], // 1 is the initialRewardPerBlock
            contract: "contracts/TokenFarm.sol:TokenFarm"
        });
        console.log("✅ TokenFarm verified successfully!");
        
        console.log("\n🎉 All contracts verified successfully!");
        console.log("\n🌐 View verified contracts on Etherscan:");
        console.log(`   • DAppToken: https://sepolia.etherscan.io/address/${contracts.DAppToken}`);
        console.log(`   • LPToken: https://sepolia.etherscan.io/address/${contracts.LPToken}`);
        console.log(`   • TokenFarm: https://sepolia.etherscan.io/address/${contracts.TokenFarm}`);
        
        // Save verification status
        const verificationInfo = {
            ...deploymentInfo,
            verified: true,
            verificationTimestamp: new Date().toISOString(),
            verificationNetwork: "Sepolia Testnet"
        };
        
        fs.writeFileSync(
            path.join(__dirname, "../verification-info.json"),
            JSON.stringify(verificationInfo, null, 2)
        );
        
        console.log("\n💾 Verification info saved to verification-info.json");
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
        
        if (error.message.includes("Already Verified")) {
            console.log("ℹ️  Contract is already verified on Etherscan");
        } else {
            console.log("\n💡 Troubleshooting tips:");
            console.log("   1. Check if contract addresses are correct");
            console.log("   2. Ensure ETHERSCAN_API_KEY is set in .env");
            console.log("   3. Wait a few minutes after deployment before verifying");
            console.log("   4. Check if contracts are deployed on Sepolia");
            console.log("   5. Verify constructor arguments match the deployed contracts");
            console.log("   6. Make sure you have the deployment-info.json file");
        }
    }
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Unexpected error:", error);
        process.exit(1);
    });
