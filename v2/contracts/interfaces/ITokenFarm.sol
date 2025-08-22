// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title ITokenFarm
 * @notice Interface común para TokenFarm V1 y V2
 */
interface ITokenFarm {
    // --- Structs ---
    struct User {
        uint256 stakingBalance;
        uint256 pendingRewards;
        bool hasStaked;
        bool isStaking;
    }

    // --- Events ---
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 netAmount, uint256 fee);
    event RewardsAccrued(address indexed user, uint256 amountAccrued, uint256 blocks);
    event RewardsDistributedAll(uint256 processedCount);
    event RewardPerBlockUpdated(uint256 newReward);
    event RewardRangeUpdated(uint256 newMin, uint256 newMax);
    event ClaimFeeUpdated(uint16 bps, address feeRecipient);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // --- Core Functions ---
    function deposit(uint256 amount) external;
    function withdraw() external;
    function claimRewards() external;
    function distributeRewardsAll() external;

    // --- View Functions ---
    function getPendingRewards(address account) external view returns (uint256);
    function stakersCount() external view returns (uint256);
    function totalStakingBalance() external view returns (uint256);
    function users(address user) external view returns (User memory);

    // --- Owner Functions ---
    function setRewardRange(uint256 _min, uint256 _max) external;
    function setRewardPerBlock(uint256 _new) external;
    function transferOwnership(address newOwner) external;
}
