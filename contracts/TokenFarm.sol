// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DAppToken.sol";
import "./LPToken.sol";

/**
 * @title Proportional Token Farm
 * @notice Granja de staking con recompensas proporcionales al total stakeado y accrual owner-triggered.
 * - REWARD: total por bloque (se prorratea por participación) con `rewardPerBlock` configurable
 * - Bonus 1: modifiers onlyOwner / onlyStaker
 * - Bonus 2: struct User + mapping(address => User)
 * - Bonus 4: recompensa por bloque configurable (con rango)
 * - Bonus 5: comisión (fee) al reclamar recompensas + retiro por el owner
 *
 * IMPORTANTE: El contrato que MINTEA DAPP es el owner del DAppToken.
 * En el script de despliegue transfiere la propiedad de DAppToken al TokenFarm.
 */
/// @title TokenFarm
/// @notice Stake LP tokens to accrue DAPP rewards per block, distributed proportionally.
contract TokenFarm {
    // --- Datos principales ---
    string public constant name = "Proportional Token Farm";

    DAppToken public immutable dappToken;
    LPToken public immutable lpToken;

    address public owner;

    // Recompensa por bloque (total para todos) + rango permitible (Bonus 4)
    uint256 public rewardPerBlock;            // variable
    uint256 public minRewardPerBlock;
    uint256 public maxRewardPerBlock;

    // Comisión en bps (Bonus 5) – 100 bps = 1%.  Ej: 500 = 5%
    uint16 public claimFeeBps;                // por defecto 0
    address public feeRecipient;              // opcional (si es address(0) se mintea a este contrato)

    // Total de tokens LPT en staking
    uint256 public totalStakingBalance;

    // Bloque del último accrual global
    uint256 public lastAccrualBlock;

    // Lista de stakers para iterar en distributeRewardsAll()
    address[] public stakers;

    // Bonus 2: Unificamos en un struct
    /// @notice Datos de usuario por staker.
    struct User {
        uint256 stakingBalance;
        uint256 pendingRewards;   // acumulado, reclamable vía claimRewards()
        bool hasStaked;
        bool isStaking;
    }
    mapping(address => User) public users;

    // --- Eventos ---
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 netAmount, uint256 fee);
    event RewardsAccrued(address indexed user, uint256 amountAccrued, uint256 blocks);
    event RewardsDistributedAll(uint256 processedCount);
    event RewardPerBlockUpdated(uint256 newReward);
    event RewardRangeUpdated(uint256 newMin, uint256 newMax);
    event ClaimFeeUpdated(uint16 bps, address feeRecipient);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // --- Modifiers (Bonus 1) ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyStaker() {
        require(users[msg.sender].isStaking && users[msg.sender].stakingBalance > 0, "Not staking");
        _;
    }

    // --- Constructor ---
    constructor(
        DAppToken _dappToken,
        LPToken _lpToken,
        uint256 _initialRewardPerBlock
    ) {
        require(address(_dappToken) != address(0) && address(_lpToken) != address(0), "Zero addr");
        dappToken = _dappToken;
        lpToken = _lpToken;

        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);

        // Por defecto el rango es [initial, initial], puedes abrirlo luego con setRewardRange
        rewardPerBlock = _initialRewardPerBlock;
        minRewardPerBlock = _initialRewardPerBlock;
        maxRewardPerBlock = _initialRewardPerBlock;
        emit RewardPerBlockUpdated(_initialRewardPerBlock);
        emit RewardRangeUpdated(minRewardPerBlock, maxRewardPerBlock);

        // fee por defecto: 0 bps, recipient = address(0) => se mintea a este contrato
        claimFeeBps = 0;
        feeRecipient = address(0);
        emit ClaimFeeUpdated(claimFeeBps, feeRecipient);

        // Inicializamos el accrual global al bloque actual
        lastAccrualBlock = block.number;
    }

    // --- Gestión de owner ---
    /// @notice Transfiere la propiedad del farm a otro owner.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "newOwner=0");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // --- Bonus 4: rango y cambio de reward por bloque ---
    /// @notice Configura rango permitido para rewardPorBloque.
    function setRewardRange(uint256 _min, uint256 _max) external onlyOwner {
        require(_min <= _max, "min>max");
        minRewardPerBlock = _min;
        maxRewardPerBlock = _max;
        emit RewardRangeUpdated(_min, _max);
        // Ajuste por si reward actual quedo fuera
        if (rewardPerBlock < _min) {
            rewardPerBlock = _min;
            emit RewardPerBlockUpdated(rewardPerBlock);
        } else if (rewardPerBlock > _max) {
            rewardPerBlock = _max;
            emit RewardPerBlockUpdated(rewardPerBlock);
        }
    }

    /// @notice Actualiza rewardPorBloque dentro del rango configurado.
    function setRewardPerBlock(uint256 _new) external onlyOwner {
        require(_new >= minRewardPerBlock && _new <= maxRewardPerBlock, "out of range");
        rewardPerBlock = _new;
        emit RewardPerBlockUpdated(_new);
    }

    // --- Bonus 5: comisión por claim ---
    /// @notice Configura fee en bps y destinatario del fee (opcional).
    function setClaimFee(uint16 _bps, address _feeRecipient) external onlyOwner {
        require(_bps <= 2_000, "fee too high (>20%)"); // límite sano
        claimFeeBps = _bps;
        feeRecipient = _feeRecipient; // puede ser 0; si lo es, se mintea a este contrato
        emit ClaimFeeUpdated(_bps, _feeRecipient);
    }

    /// @notice Retira fees acumulados (DAPP) hacia `to` o al owner si `to==0`.
    function withdrawFees(uint256 amount, address to) external onlyOwner {
        address recipient = to == address(0) ? owner : to;
        require(dappToken.balanceOf(address(this)) >= amount, "insufficient fees");
        dappToken.transfer(recipient, amount);
    }

    // --- Vistas útiles para tests/UI ---
    /// @notice Cantidad de stakers que han participado históricamente.
    function stakersCount() external view returns (uint256) {
        return stakers.length;
    }

    /// @notice Recompensas pendientes del `account`.
    function getPendingRewards(address account) external view returns (uint256) {
        return users[account].pendingRewards;
    }

    // --- Lógica principal ---

    /**
     * @notice Deposita tokens LP para staking.
     * - Resetea el lastAccrualBlock para que no cuenten los bloques de esta tx
     */
    /// @notice Deposita `amount` de LPT para comenzar/continuar el staking.
    function deposit(uint256 amount) external {
        require(amount > 0, "amount=0");

        // transferir tokens LP al contrato
        lpToken.transferFrom(msg.sender, address(this), amount);

        // actualizar balances
        User storage u = users[msg.sender];
        if (!u.hasStaked) {
            stakers.push(msg.sender);
            u.hasStaked = true;
        }
        u.isStaking = true;
        u.stakingBalance += amount;
        totalStakingBalance += amount;

        // Evitar que cuenten los bloques de esta tx
        lastAccrualBlock = block.number;

        emit Deposit(msg.sender, amount);
    }

    /**
     * @notice Retira todos los tokens LP en staking.
     * - Resetea el lastAccrualBlock para que no cuenten los bloques de esta tx
     */
    /// @notice Retira todo el LPT del usuario. Mantiene rewards pendientes.
    function withdraw() external onlyStaker {
        User storage u = users[msg.sender];
        uint256 balance = u.stakingBalance;
        require(balance > 0, "no stake");

        // actualizar contadores
        u.stakingBalance = 0;
        u.isStaking = false;
        totalStakingBalance -= balance;

        // transferir LPT de vuelta
        lpToken.transfer(msg.sender, balance);

        // Evitar que cuenten los bloques de esta tx
        lastAccrualBlock = block.number;

        emit Withdraw(msg.sender, balance);
    }

    /**
     * @notice Reclama recompensas pendientes. Aplica fee si está configurado.
     */
    /// @notice Reclama las recompensas pendientes, aplicando fee si corresponde.
    function claimRewards() external {
        User storage u = users[msg.sender];
        uint256 pendingAmount = u.pendingRewards;
        require(pendingAmount > 0, "nothing to claim");

        // reset pendiente
        u.pendingRewards = 0;

        // calcular fee
        uint256 fee = (pendingAmount * claimFeeBps) / 10_000;
        uint256 net = pendingAmount - fee;

        // mintear neto al usuario (este contrato debe ser owner del DAppToken)
        dappToken.mint(msg.sender, net);

        if (fee > 0) {
            address sink = feeRecipient == address(0) ? address(this) : feeRecipient;
            dappToken.mint(sink, fee);
        }

        emit RewardsClaimed(msg.sender, net, fee);
    }

    /**
     * @notice Recalcula y acumula recompensas para TODOS los stakers activos.
     * Solo el owner (según enunciado).
     */
    /// @notice Acumula recompensas para todos los stakers activos proporcionalmente.
    function distributeRewardsAll() external onlyOwner {
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

        // Excluir el bloque actual (el de esta transacción)
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

    /**
     * @notice Interna: calcula y acumula recompensas proporcionales para `beneficiary`.
     *
     * Fórmula:
     * reward = rewardPerBlock * blocksPassed * (userStake / totalStake)
     */
    function _distributeRewards(address /*beneficiary*/ ) internal pure {}
}


