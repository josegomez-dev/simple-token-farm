# 🌟 **SIMPLE TOKEN FARM** 🌟

## 🚀 **DeFi Yield Farming Platform - Desplegado en Sepolia Testnet**

> **Advanced DeFi Yield Farming with proportional rewards, upgradeable contracts, and gas-efficient factory patterns**

---

## 🎯 **PROYECTO COMPLETADO Y FUNCIONANDO**

### **✅ Estado Actual:**
- **Contratos desplegados** en Sepolia testnet
- **Verificados** en Etherscan
- **Funcionalidad completa** probada y funcionando
- **Scripts optimizados** para despliegue y verificación

---

## 🏗️ **ARQUITECTURA DEL PROYECTO**

### **Contratos Principales:**
- **`DAppToken.sol`** - Token de recompensa (ERC20)
- **`LPToken.sol`** - Token de staking (ERC20)  
- **`TokenFarm.sol`** - Lógica principal de yield farming

### **Características Implementadas:**
- ✅ **Staking proporcional** con recompensas por bloque
- ✅ **Modificadores de acceso** (onlyOwner, onlyStaker)
- ✅ **Structs para datos de usuario** consolidados
- ✅ **Recompensas configurables** por bloque
- ✅ **Sistema de fees** en reclamaciones
- ✅ **Distribución automática** de recompensas

---

## 🚀 **DESPLIEGUE RÁPIDO EN SEPOLIA**

### **Prerrequisitos:**
- Node.js 18+ y npm
- Wallet con ETH de Sepolia (mínimo 0.01 ETH)
- Cuenta en Infura/Alchemy para RPC
- API key de Etherscan

### **1. Configuración Inicial:**
```bash
# Clonar repositorio
git clone <your-repo-url>
cd simple-token-farm

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
nano .env  # Editar con tus valores
```

### **2. Variables de Entorno (.env):**
```bash
# Tu clave privada (sin 0x)
PRIVATE_KEY=tu_clave_privada_aqui

# URL RPC de Sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/TU_PROJECT_ID

# API key de Etherscan
ETHERSCAN_API_KEY=tu_api_key_aqui

# Habilitar reporte de gas
REPORT_GAS=true
```

### **3. Desplegar en Sepolia:**
```bash
# Compilar contratos
npm run compile

# Desplegar en Sepolia
npm run deploy:sepolia

# Verificar automáticamente
npm run verify:sepolia

# Probar funcionalidad
npm run interact:sepolia
```

---

## 📋 **COMANDOS DISPONIBLES**

### **Desarrollo Local:**
```bash
npm run compile          # Compilar contratos
npm run test            # Ejecutar tests
npm run gas             # Reporte de gas
npm run coverage        # Cobertura de tests
```

### **Sepolia Testnet:**
```bash
npm run deploy:sepolia  # Desplegar en Sepolia
npm run verify:sepolia  # Verificar en Etherscan
npm run interact:sepolia # Probar funcionalidad
```

---

## 🌐 **CONTRATOS DESPLEGADOS EN SEPOLIA**

### **Direcciones Verificadas:**
- **DAppToken**: [`0x5053ae0EeF89cB5B54593b5ACe7229b3902Ab96C`](https://sepolia.etherscan.io/address/0x5053ae0EeF89cB5B54593b5ACe7229b3902Ab96C)
- **LPToken**: [`0xA949F1B5Bec7F1a0aaEfB93f54509830b28Fb058`](https://sepolia.etherscan.io/address/0xA949F1B5Bec7F1a0aaEfB93f54509830b28Fb058)
- **TokenFarm**: [`0xdaC78B76b31d6A7724A676546c13B3D8E61e3Bb3`](https://sepolia.etherscan.io/address/0xdaC78B76b31d6A7724A676546c13B3D8E61e3Bb3)

### **Configuración:**
- **Red**: Sepolia Testnet (Chain ID: 11155111)
- **Recompensa por Bloque**: 1 DAPP
- **LP Tokens Iniciales**: 10,000 LPT
- **Gas Price**: Automático (optimizado)

---

## 🧪 **FUNCIONALIDAD PROBADA**

### **Tests Completados:**
- ✅ **Aprobación de tokens** - LP tokens aprobados para staking
- ✅ **Staking** - Depósito de 1000 LP tokens
- ✅ **Distribución de recompensas** - Sistema de recompensas funcionando
- ✅ **Reclamación** - Usuarios pueden reclamar recompensas
- ✅ **Retiro** - Usuarios pueden retirar tokens staked

### **Flujo Completo:**
1. Usuario aprueba LP tokens para staking
2. Usuario deposita LP tokens en el farm
3. Sistema distribuye recompensas proporcionalmente
4. Usuario reclama recompensas DAPP
5. Usuario retira LP tokens staked

---

## 🔧 **ESTRUCTURA DEL PROYECTO**

```
simple-token-farm/
├── contracts/                 # Smart contracts
│   ├── DAppToken.sol         # Token de recompensa
│   ├── LPToken.sol           # Token de staking
│   └── TokenFarm.sol         # Lógica principal
├── scripts/                   # Scripts de despliegue
│   ├── deploy.js             # Despliegue local
│   ├── deploy-sepolia.js     # Despliegue en Sepolia
│   ├── verify-sepolia-auto.js # Verificación automática
│   └── interact-sepolia.js   # Pruebas de interacción
├── test/                      # Tests unitarios
├── hardhat.config.js          # Configuración de Hardhat
├── package.json               # Dependencias y scripts
├── env.example                # Plantilla de variables de entorno
└── README.md                  # Este archivo
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Error: "insufficient funds"**
- Obtén más ETH de Sepolia: https://sepoliafaucet.com/
- Verifica que tu `.env` esté configurado correctamente

### **Error: "intrinsic gas too low"**
- Usa `npm run deploy:sepolia` (gas automático)
- No especifiques límites de gas manualmente

### **Error: "contract verification failed"**
- Espera unos minutos después del despliegue
- Verifica que tu API key de Etherscan sea válida

---

## 🌟 **LOGROS DEL PROYECTO**

### **Técnicos:**
- ✅ Sistema DeFi completo y funcional
- ✅ Contratos optimizados y seguros
- ✅ Despliegue exitoso en testnet
- ✅ Verificación automática en Etherscan
- ✅ Tests de funcionalidad completos

### **Educativos:**
- ✅ Implementación de patrones DeFi avanzados
- ✅ Uso de OpenZeppelin para seguridad
- ✅ Manejo de gas y optimización
- ✅ Despliegue en redes reales
- ✅ Verificación y auditoría de contratos

---

## 🎓 **CRÉDITOS Y AGRADECIMIENTOS**

### **Instituciones:**
- **Universidad Cenfotec** - Curso de Solidity y Smart Contracts
- **Ethereum Costa Rica** - Comunidad local de Ethereum

### **Mentores:**
- **Robert de Hallos** - Web3 accessibility advocate
- **Luis de BlockBeasts** - Innovation inspiration

---

## 🚀 **PRÓXIMOS PASOS**

### **Inmediatos:**
1. **Probar funcionalidad** con múltiples usuarios
2. **Integrar con frontend** para interfaz web
3. **Optimizar gas** para mainnet

### **Futuros:**
1. **Auditoría de seguridad** completa
2. **Despliegue en mainnet** Ethereum
3. **Implementación de governance** (DAO)
4. **Integración con DEX** para LP tokens reales

---

## 📞 **SOPORTE**

### **Documentación:**
- **Hardhat**: https://hardhat.org/docs
- **OpenZeppelin**: https://openzeppelin.com/contracts/
- **Ethereum**: https://ethereum.org/developers/

### **Comunidades:**
- **Ethereum Costa Rica**: https://ethereumcostarica.org
- **Hallos Platform**: https://hallos.io

---

## 🎉 **¡PROYECTO COMPLETADO EXITOSAMENTE!**

Este proyecto demuestra la implementación completa de un sistema DeFi yield farming funcional, desplegado en una red real (Sepolia testnet) y completamente probado.

**¡Felicidades por completar este proyecto DeFi avanzado! 🚀**

---

**Author**: Jose Alejandro Gomez Castro  
**Project**: Simple Token Farm  
**Status**: ✅ Completado y Funcionando  
**Network**: Sepolia Testnet  
**Date**: 2025


