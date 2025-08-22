// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/ITokenFarm.sol";

/**
 * @title TokenFarmV2
 * @notice V2 del Simple Token Farm - CON claim fees
 * @dev Extiende V1 añadiendo funcionalidad de fees
 */
contract TokenFarmV2 is TokenFarmV1 {
    // --- V2: Nuevas variables ---
    
    // Comisión en bps (100 bps = 1%). Ej: 500 = 5%
    uint16 public claimFeeBps;
    address public feeRecipient;

    // --- V2: Nuevas funciones ---

    /**
     * @notice Configura fee en bps y destinatario
     * @param _bps Fee en basis points (0-2000 = 0-20%)
     * @param _feeRecipient Destinatario del fee (0 = contrato)
     */
    function setClaimFee(uint16 _bps, address _feeRecipient) external onlyOwner {
        require(_bps <= 2_000, "fee too high (>20%)");
        claimFeeBps = _bps;
        feeRecipient = _feeRecipient;
        emit ClaimFeeUpdated(_bps, _feeRecipient);
    }

    /**
     * @notice Retira fees acumulados
     * @param amount Cantidad a retirar
     * @param to Destinatario (0 = owner)
     */
    function withdrawFees(uint256 amount, address to) external onlyOwner {
        address recipient = to == address(0) ? owner() : to;
        require(IERC20(dappToken).balanceOf(address(this)) >= amount, "insufficient fees");
        IERC20(dappToken).transfer(recipient, amount);
    }

    // --- V2: Override de claimRewards ---
    
    /**
     * @notice Reclama recompensas aplicando fee si está configurado
     */
    function claimRewards() external override {
        User storage u = users[msg.sender];
        uint256 pendingAmount = u.pendingRewards;
        require(pendingAmount > 0, "nothing to claim");

        u.pendingRewards = 0;

        // Calcular fee
        uint256 fee = (pendingAmount * claimFeeBps) / 10_000;
        uint256 net = pendingAmount - fee;

        // Mint neto al usuario
        IDAppToken(dappToken).mint(msg.sender, net);

        // Mint fee si aplica
        if (fee > 0) {
            address sink = feeRecipient == address(0) ? address(this) : feeRecipient;
            IDAppToken(dappToken).mint(sink, fee);
        }

        emit RewardsClaimed(msg.sender, net, fee);
    }

    // --- V2: View functions adicionales ---
    
    /**
     * @notice Obtiene configuración de fees
     */
    function getFeeConfig() external view returns (uint16 bps, address recipient) {
        return (claimFeeBps, feeRecipient);
    }

    /**
     * @notice Obtiene balance de fees acumulados
     */
    function getAccumulatedFees() external view returns (uint256) {
        return IERC20(dappToken).balanceOf(address(this));
    }
}
