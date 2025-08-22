// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/ITokenFarm.sol";

/**
 * @title TokenFarmV1
 * @notice V1 del Simple Token Farm - SIN claim fees
 * @dev Implementación base upgradeable usando UUPS
 */
contract TokenFarmV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable, ITokenFarm {
    // --- Datos principales ---
    string public constant name = "Proportional Token Farm V1";

    // Tokens (se inicializan en initialize())
    address public dappToken;
    address public lpToken;

    // Recompensa por bloque configurable
    uint256 public rewardPerBlock;
    uint256 public minRewardPerBlock;
    uint256 public maxRewardPerBlock;

    // Total de tokens LPT en staking
    uint256 public totalStakingBalance;

    // Bloque del último accrual global
    uint256 public lastAccrualBlock;

    // Lista de stakers
    address[] public stakers;

    // Mapping de usuarios
    mapping(address => User) public users;

    // --- Modifiers ---
    modifier onlyStaker() {
        require(users[msg.sender].isStaking && users[msg.sender].stakingBalance > 0, "Not staking");
        _;
    }

    // --- Constructor (no usado en proxy) ---
    constructor() {
        _disableInitializers();
    }

    // --- Initialize (usado en proxy) ---
    function initialize(
        address _dappToken,
        address _lpToken,
        uint256 _initialRewardPerBlock,
        address _owner
    ) public initializer {
        require(_dappToken != address(0) && _lpToken != address(0), "Zero addr");
        dappToken = _dappToken;
        lpToken = _lpToken;

        _transferOwnership(_owner);

        rewardPerBlock = _initialRewardPerBlock;
        minRewardPerBlock = _initialRewardPerBlock;
        maxRewardPerBlock = _initialRewardPerBlock;
        lastAccrualBlock = block.number;

        emit RewardPerBlockUpdated(_initialRewardPerBlock);
        emit RewardRangeUpdated(minRewardPerBlock, maxRewardPerBlock);
    }

    // --- UUPS Required ---
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // --- Core Functions ---
    function deposit(uint256 amount) external override {
        require(amount > 0, "amount=0");

        // Transferir tokens LP
        IERC20(lpToken).transferFrom(msg.sender, address(this), amount);

        // Actualizar balances
        User storage u = users[msg.sender];
        if (!u.hasStaked) {
            stakers.push(msg.sender);
            u.hasStaked = true;
        }
        u.isStaking = true;
        u.stakingBalance += amount;
        totalStakingBalance += amount;

        // Reset accrual block
        lastAccrualBlock = block.number;

        emit Deposit(msg.sender, amount);
    }

    function withdraw() external override onlyStaker {
        User storage u = users[msg.sender];
        uint256 balance = u.stakingBalance;
        require(balance > 0, "no stake");

        u.stakingBalance = 0;
        u.isStaking = false;
        totalStakingBalance -= balance;

        IERC20(lpToken).transfer(msg.sender, balance);
        lastAccrualBlock = block.number;

        emit Withdraw(msg.sender, balance);
    }

    function claimRewards() external override {
        User storage u = users[msg.sender];
        uint256 pendingAmount = u.pendingRewards;
        require(pendingAmount > 0, "nothing to claim");

        u.pendingRewards = 0;
        
        // Mint DAPP tokens (sin fee en V1)
        IDAppToken(dappToken).mint(msg.sender, pendingAmount);

        emit RewardsClaimed(msg.sender, pendingAmount, 0);
    }

    function distributeRewardsAll() external override onlyOwner {
        if (block.number <= lastAccrualBlock) {
            emit RewardsDistributedAll(0);
            return;
        }

        uint256 blocksPassed = block.number - lastAccrualBlock;
        if (blocksPassed == 0 || totalStakingBalance == 0) {
            lastAccrualBlock = block.number;
            emit RewardsDistributedAll(0);
            return;
        }

        uint256 effectiveBlocks = blocksPassed - 1;
        if (effectiveBlocks == 0) {
            emit RewardsDistributedAll(0);
            return;
        }

        uint256 processed;
        for (uint256 i = 0; i < stakers.length; i++) {
            address s = stakers[i];
            User storage u = users[s];
            if (u.isStaking && u.stakingBalance > 0) {
                uint256 amount = (u.stakingBalance * rewardPerBlock * effectiveBlocks) / totalStakingBalance;
                if (amount > 0) {
                    u.pendingRewards += amount;
                    emit RewardsAccrued(s, amount, effectiveBlocks);
                }
                processed++;
            }
        }
        lastAccrualBlock = block.number;
        emit RewardsDistributedAll(processed);
    }

    // --- Owner Functions ---
    function setRewardRange(uint256 _min, uint256 _max) external override onlyOwner {
        require(_min <= _max, "min>max");
        minRewardPerBlock = _min;
        maxRewardPerBlock = _max;
        emit RewardRangeUpdated(_min, _max);
        
        if (rewardPerBlock < _min) {
            rewardPerBlock = _min;
            emit RewardPerBlockUpdated(rewardPerBlock);
        } else if (rewardPerBlock > _max) {
            rewardPerBlock = _max;
            emit RewardPerBlockUpdated(rewardPerBlock);
        }
    }

    function setRewardPerBlock(uint256 _new) external override onlyOwner {
        require(_new >= minRewardPerBlock && _new <= maxRewardPerBlock, "out of range");
        rewardPerBlock = _new;
        emit RewardPerBlockUpdated(_new);
    }

    // --- View Functions ---
    function getPendingRewards(address account) external view override returns (uint256) {
        return users[account].pendingRewards;
    }

    function stakersCount() external view override returns (uint256) {
        return stakers.length;
    }

    // --- Interfaces ---
    interface IERC20 {
        function transferFrom(address from, address to, uint256 amount) external returns (bool);
        function transfer(address to, uint256 amount) external returns (bool);
    }

    interface IDAppToken {
        function mint(address to, uint256 amount) external;
    }
}
