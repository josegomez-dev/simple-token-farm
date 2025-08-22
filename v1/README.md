# Simple Token Farm V1 - Factory + Clones Pattern

## 🚀 Bonus 6: Implementación con Factory + Clones

**Ubicación**: `/v1` del repositorio principal `simple-token-farm`

Esta implementación resuelve el problema de **múltiples farms** usando el patrón **EIP-1167 Minimal Proxy** para ahorrar gas en despliegues.

### 🔧 Características

- **Factory Pattern**: Un contrato que despliega múltiples farms
- **Minimal Proxy**: Cada farm es un proxy que apunta a la implementación
- **Gas Efficient**: Solo se paga gas por estado único, no por lógica
- **Múltiples Farms**: Diferentes tokens LP pueden tener sus propias farms
- **Configuración Flexible**: Cada farm puede tener diferentes parámetros

### 📁 Estructura

```
simple-token-farm/                    # 🏠 Repositorio Principal
├── contracts/                        # 📜 Contratos Base (funcionando)
├── v1/                              # 🏭 Factory + Clones (este directorio)
│   ├── contracts/                   # Contratos para múltiples farms
│   │   └── TokenFarmFactory.sol    # Factory que despliega clones
│   └── README.md                    # Este archivo
└── v2/                              # 🔄 Proxy Upgradeable Pattern
```

### 🎯 Casos de Uso

1. **Deploy Factory**: Una vez, despliega la implementación base
2. **Crear Farm**: Por cada nuevo token LP, crear farm con 1 transacción
3. **Configurar Farm**: Cada farm puede tener diferentes rewards/fees
4. **Escalar**: Crear 100 farms con solo 100 transacciones (no 100 deploys)

### 💡 Ventajas del Patrón Clones

- ✅ **Gas Efficient**: ~45k gas por farm vs ~2M gas por deploy completo
- ✅ **Lógica Única**: Una implementación para todas las farms
- ✅ **Estado Aislado**: Cada farm tiene su propio estado
- ✅ **Upgradeable**: Se puede actualizar la implementación base
- ✅ **Escalable**: Fácil crear muchas farms

### 🚀 Uso

```bash
# Desde el directorio principal
cd simple-token-farm

# Deploy factory (una vez)
npx hardhat run v1/scripts/deploy-factory.js

# Crear nueva farm para token LP
npx hardhat run v1/scripts/create-farm.js --token 0x123... --reward 1

# Listar farms creadas
npx hardhat run v1/scripts/list-farms.js
```

### 🔄 Flujo de Creación

1. **Factory** tiene la implementación base
2. **Usuario** llama `createFarm(token, reward)`
3. **Factory** despliega proxy minimal
4. **Proxy** se inicializa con parámetros únicos
5. **Farm** está lista para staking

---

## 📊 Comparación de Gas

| Método | Gas por Farm | 10 Farms | 100 Farms |
|--------|--------------|----------|-----------|
| Deploy Completo | ~2,000,000 | 20M | 200M |
| **Clones** | **~45,000** | **450K** | **4.5M** |
| **Ahorro** | **97.75%** | **97.75%** | **97.75%** |

---

## 🔗 Enlaces del Proyecto

- **🏠 [Repositorio Principal](../README.md)** - Simple Token Farm completo
- **🔄 [V2: Proxy Upgradeable](../v2/README.md)** - Implementación upgradeable
- **📊 [Comparación Bonus 6](../BONUS_6_COMPARISON.md)** - Análisis detallado

---

## 📚 Referencias

- [EIP-1167: Minimal Proxy Contract](https://eips.ethereum.org/EIPS/eip-1167)
- [OpenZeppelin Clones](https://docs.openzeppelin.com/contracts/4.x/api/proxy#Clones)
- [Factory Pattern](https://solidity-by-example.org/factory/)
- [Gas Optimization](https://ethereum.org/en/developers/docs/gas/)
