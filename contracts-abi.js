// 🌟 CONTRACT ABIs FOR WEB3 INTEGRATION 🌟
// ABIs needed to interact with deployed contracts on Sepolia

// DAppToken ABI (ERC20 + Ownable)
export const DAPP_TOKEN_ABI = [
    // ERC20 Standard Functions
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}],
        "name": "balanceOf",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "uint256"}],
        "name": "transfer",
        "outputs": [{"type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "address"}, {"type": "uint256"}],
        "name": "transferFrom",
        "outputs": [{"type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "uint256"}],
        "name": "approve",
        "outputs": [{"type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "address"}],
        "name": "allowance",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    // Ownable Functions
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // Mint Function
    {
        "inputs": [{"type": "address"}, {"type": "uint256"}],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // Events
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": true, "type": "address"},
            {"indexed": false, "type": "uint256"}
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": true, "type": "address"},
            {"indexed": false, "type": "uint256"}
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": true, "type": "address"}
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    }
];

// LPToken ABI (ERC20 + Ownable)
export const LP_TOKEN_ABI = [
    // ERC20 Standard Functions (same as DAppToken)
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}],
        "name": "balanceOf",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "uint256"}],
        "name": "transfer",
        "outputs": [{"type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "address"}, {"type": "uint256"}],
        "name": "transferFrom",
        "outputs": [{"type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "uint256"}],
        "name": "approve",
        "outputs": [{"type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}, {"type": "address"}],
        "name": "allowance",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    // Ownable Functions
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // Mint Function
    {
        "inputs": [{"type": "address"}, {"type": "uint256"}],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // Events
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": true, "type": "address"},
            {"indexed": false, "type": "uint256"}
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": true, "type": "address"},
            {"indexed": false, "type": "uint256"}
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": true, "type": "address"}
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    }
];

// TokenFarm ABI (Main Contract)
export const TOKEN_FARM_ABI = [
    // View Functions
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "dappToken",
        "outputs": [{"type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lpToken",
        "outputs": [{"type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardPerBlock",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalStakingBalance",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stakersCount",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "address"}],
        "name": "users",
        "outputs": [
            {"type": "uint256", "name": "stakingBalance"},
            {"type": "uint256", "name": "pendingRewards"},
            {"type": "bool", "name": "hasStaked"},
            {"type": "bool", "name": "isStaking"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    // State-Changing Functions
    {
        "inputs": [{"type": "uint256"}],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "distributeRewardsAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // Owner Functions
    {
        "inputs": [{"type": "uint256"}],
        "name": "setRewardPerBlock",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // Events
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": false, "type": "uint256"}
        ],
        "name": "Deposit",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": false, "type": "uint256"}
        ],
        "name": "Withdraw",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": false, "type": "uint256"},
            {"indexed": false, "type": "uint256"}
        ],
        "name": "RewardsClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "type": "address"},
            {"indexed": false, "type": "uint256"},
            {"indexed": false, "type": "uint256"}
        ],
        "name": "RewardsAccrued",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{"indexed": false, "type": "uint256"}],
        "name": "RewardsDistributedAll",
        "type": "event"
    }
];

// Contract Addresses on Sepolia
export const CONTRACT_ADDRESSES = {
    sepolia: {
        dappToken: '0x5053ae0EeF89cB5B54593b5ACe7229b3902Ab96C',
        lpToken: '0xA949F1B5Bec7F1a0aaEfB93f54509830b28Fb058',
        tokenFarm: '0xdaC78B76b31d6A7724A676546c13B3D8E61e3Bb3'
    }
};

// Network Information
export const NETWORKS = {
    1: {
        name: 'Ethereum Mainnet',
        color: '#4CAF50',
        explorer: 'https://etherscan.io'
    },
    11155111: {
        name: 'Sepolia Testnet',
        color: '#ff6b35',
        explorer: 'https://sepolia.etherscan.io'
    },
    5: {
        name: 'Goerli Testnet',
        color: '#9C27B0',
        explorer: 'https://goerli.etherscan.io'
    },
    137: {
        name: 'Polygon Mainnet',
        color: '#8BC34A',
        explorer: 'https://polygonscan.com'
    },
    80001: {
        name: 'Mumbai Testnet',
        color: '#FF9800',
        explorer: 'https://mumbai.polygonscan.com'
    }
};
