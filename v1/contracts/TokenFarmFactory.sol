// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TokenFarm.sol";

/**
 * @title TokenFarmFactory
 * @notice Factory que despliega farms usando minimal proxies (EIP-1167)
 * @dev Ahorra gas creando múltiples farms con la misma lógica
 */
contract TokenFarmFactory is Ownable {
    // --- Variables ---
    
    // Implementación base (lógica compartida)
    TokenFarm public immutable implementation;
    
    // Lista de farms creadas
    address[] public farms;
    
    // Mapping de token LP a farm
    mapping(address => address) public tokenToFarm;
    
    // Mapping de farm a info
    mapping(address => FarmInfo) public farmInfo;
    
    // --- Structs ---
    
    struct FarmInfo {
        address lpToken;
        address dappToken;
        uint256 rewardPerBlock;
        uint256 createdAt;
        bool isActive;
    }
    
    // --- Events ---
    
    event FarmCreated(
        address indexed farm,
        address indexed lpToken,
        address indexed dappToken,
        uint256 rewardPerBlock
    );
    
    event FarmDeactivated(address indexed farm);
    
    // --- Constructor ---
    
    constructor() Ownable(msg.sender) {
        // Deploy la implementación base
        implementation = new TokenFarm();
    }
    
    // --- Core Functions ---
    
    /**
     * @notice Crea una nueva farm para un token LP
     * @param lpToken Address del token LP para staking
     * @param dappToken Address del token de recompensa
     * @param rewardPerBlock Recompensa por bloque inicial
     * @param initialOwner Owner inicial de la farm
     */
    function createFarm(
        address lpToken,
        address dappToken,
        uint256 rewardPerBlock,
        address initialOwner
    ) external onlyOwner returns (address farm) {
        require(lpToken != address(0), "LP token zero");
        require(dappToken != address(0), "DAPP token zero");
        require(initialOwner != address(0), "Owner zero");
        require(tokenToFarm[lpToken] == address(0), "Farm exists");
        
        // Crear proxy minimal usando Clones
        farm = Clones.clone(address(implementation));
        
        // Inicializar la farm
        TokenFarm(farm).initialize(
            dappToken,
            lpToken,
            rewardPerBlock,
            initialOwner
        );
        
        // Registrar la farm
        farms.push(farm);
        tokenToFarm[lpToken] = farm;
        farmInfo[farm] = FarmInfo({
            lpToken: lpToken,
            dappToken: dappToken,
            rewardPerBlock: rewardPerBlock,
            createdAt: block.timestamp,
            isActive: true
        });
        
        emit FarmCreated(farm, lpToken, dappToken, rewardPerBlock);
    }
    
    /**
     * @notice Desactiva una farm (emergency)
     * @param farm Address de la farm a desactivar
     */
    function deactivateFarm(address farm) external onlyOwner {
        require(farmInfo[farm].isActive, "Farm not active");
        
        farmInfo[farm].isActive = false;
        emit FarmDeactivated(farm);
    }
    
    // --- View Functions ---
    
    /**
     * @notice Obtiene todas las farms creadas
     */
    function getAllFarms() external view returns (address[] memory) {
        return farms;
    }
    
    /**
     * @notice Obtiene farms activas
     */
    function getActiveFarms() external view returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < farms.length; i++) {
            if (farmInfo[farms[i]].isActive) {
                activeCount++;
            }
        }
        
        address[] memory activeFarms = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < farms.length; i++) {
            if (farmInfo[farms[i]].isActive) {
                activeFarms[index] = farms[i];
                index++;
            }
        }
        
        return activeFarms;
    }
    
    /**
     * @notice Obtiene info de una farm
     */
    function getFarmInfo(address farm) external view returns (FarmInfo memory) {
        return farmInfo[farm];
    }
    
    /**
     * @notice Obtiene farm por token LP
     */
    function getFarmByToken(address lpToken) external view returns (address) {
        return tokenToFarm[lpToken];
    }
    
    /**
     * @notice Cuenta total de farms
     */
    function getFarmsCount() external view returns (uint256) {
        return farms.length;
    }
    
    /**
     * @notice Cuenta farms activas
     */
    function getActiveFarmsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < farms.length; i++) {
            if (farmInfo[farms[i]].isActive) {
                count++;
            }
        }
        return count;
    }
}
