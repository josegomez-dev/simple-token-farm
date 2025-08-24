// 🔍 SEPOLIA CONTRACT VERIFICATION SCRIPT 🔍
// Verify deployed contracts on Sepolia Etherscan

const { run } = require("hardhat");

async function main() {
    console.log("🔍 Starting contract verification on Sepolia...");
    
    // Contract addresses from deployment (replace with your actual addresses)
    const DAPP_TOKEN_ADDRESS = "YOUR_DAPP_TOKEN_ADDRESS_HERE";
    const LP_TOKEN_ADDRESS = "YOUR_LP_TOKEN_ADDRESS_HERE";
    const TOKEN_FARM_ADDRESS = "YOUR_TOKEN_FARM_ADDRESS_HERE";
    
    try {
        // 1. Verify DAppToken - requires initialOwner parameter
        console.log("\n📦 Verifying DAppToken...");
        await run("verify:verify", {
            address: DAPP_TOKEN_ADDRESS,
            constructorArguments: ["YOUR_DEPLOYER_ADDRESS_HERE"], // Replace with actual deployer address
            contract: "contracts/DAppToken.sol:DAppToken"
        });
        console.log("✅ DAppToken verified successfully!");
        
        // 2. Verify LPToken - requires initialOwner parameter
        console.log("\n📦 Verifying LPToken...");
        await run("verify:verify", {
            address: LP_TOKEN_ADDRESS,
            constructorArguments: ["YOUR_DEPLOYER_ADDRESS_HERE"], // Replace with actual deployer address
            contract: "contracts/LPToken.sol:LPToken"
        });
        console.log("✅ LPToken verified successfully!");
        
        // 3. Verify TokenFarm - requires dappToken, lpToken, and initialRewardPerBlock
        console.log("\n📦 Verifying TokenFarm...");
        await run("verify:verify", {
            address: TOKEN_FARM_ADDRESS,
            constructorArguments: [DAPP_TOKEN_ADDRESS, LP_TOKEN_ADDRESS, 1], // 1 is the initialRewardPerBlock
            contract: "contracts/TokenFarm.sol:TokenFarm"
        });
        console.log("✅ TokenFarm verified successfully!");
        
        console.log("\n🎉 All contracts verified successfully!");
        console.log("\n🌐 View verified contracts on Etherscan:");
        console.log(`   • DAppToken: https://sepolia.etherscan.io/address/${DAPP_TOKEN_ADDRESS}`);
        console.log(`   • LPToken: https://sepolia.etherscan.io/address/${LP_TOKEN_ADDRESS}`);
        console.log(`   • TokenFarm: https://sepolia.etherscan.io/address/${TOKEN_FARM_ADDRESS}`);
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
        
        if (error.message.includes("Already Verified")) {
            console.log("ℹ️  Contract is already verified on Etherscan");
        } else {
            console.log("💡 Troubleshooting tips:");
            console.log("   1. Check if contract addresses are correct");
            console.log("   2. Ensure ETHERSCAN_API_KEY is set in .env");
            console.log("   3. Wait a few minutes after deployment before verifying");
            console.log("   4. Check if contracts are deployed on Sepolia");
            console.log("   5. Verify constructor arguments match the deployed contracts");
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
