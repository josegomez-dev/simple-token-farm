# Simple Token Farm V2 - Proxy Upgradeable

## 🚀 Bonus 6: Implementación con Proxy UUPS

**Ubicación**: `/v2` del repositorio principal `simple-token-farm`

Esta es la **V2** del Simple Token Farm que implementa el **Bonus 5 (Claim Fee)** usando un patrón de proxy upgradeable.

### 🔧 Características V2

- **Proxy UUPS**: Contrato upgradeable sin perder estado
- **Claim Fee**: Comisión configurable al reclamar recompensas
- **Fee Management**: Owner puede retirar fees acumulados
- **Backward Compatible**: Mantiene toda la funcionalidad V1

### 📁 Estructura

```
simple-token-farm/                    # 🏠 Repositorio Principal
├── contracts/                        # 📜 Contratos Base (funcionando)
├── v2/                              # 🔄 Proxy Upgradeable (este directorio)
│   ├── contracts/                   # Contratos upgradeable
│   │   ├── interfaces/
│   │   │   └── ITokenFarm.sol      # Interface común
│   │   ├── TokenFarmV1.sol         # Implementación base (sin fee)
│   │   └── TokenFarmV2.sol         # Implementación V2 (con fee)
│   └── README.md                    # Este archivo
└── v1/                              # 🏭 Factory + Clones Pattern
```

### 🎯 Casos de Uso

1. **Deploy V1**: Farm básica sin fees
2. **Upgrade a V2**: Añadir claim fees sin perder estado
3. **Configurar Fees**: Owner puede activar/desactivar fees
4. **Retirar Fees**: Owner puede retirar fees acumulados

### 💡 Ventajas del Proxy

- ✅ **Estado Preservado**: Stakes y rewards se mantienen
- ✅ **Gas Efficient**: Solo deploy de lógica, no estado
- ✅ **Upgradeable**: Fácil añadir nuevas features
- ✅ **Backward Compatible**: APIs existentes funcionan

### 🚀 Uso

```bash
# Desde el directorio principal
cd simple-token-farm

# Deploy V1
npx hardhat run v2/scripts/deploy-v1.js

# Upgrade a V2
npx hardhat run v2/scripts/upgrade.js

# Configurar fees
await farmV2.setClaimFee(500, feeRecipient);
```

---

## 🔄 Comparación V1 vs V2

| Feature | V1 | V2 |
|---------|----|----|
| Staking | ✅ | ✅ |
| Rewards | ✅ | ✅ |
| Claim Fee | ❌ | ✅ |
| Fee Management | ❌ | ✅ |
| Upgradeable | ❌ | ✅ |
| Gas Cost | Bajo | Medio |

---

## 🔗 Enlaces del Proyecto

- **🏠 [Repositorio Principal](../README.md)** - Simple Token Farm completo
- **🏭 [V1: Factory + Clones](../v1/README.md)** - Múltiples farms eficientes
- **📊 [Comparación Bonus 6](../BONUS_6_COMPARISON.md)** - Análisis detallado

---

## 📚 Referencias

- [OpenZeppelin UUPS Proxy](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable)
- [Hardhat Upgrades Plugin](https://docs.openzeppelin.com/hardhat-upgrades/)
- [Proxy Patterns](https://blog.openzeppelin.com/proxy-patterns/)
