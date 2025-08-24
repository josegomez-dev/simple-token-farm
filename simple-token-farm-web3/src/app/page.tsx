'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Contract ABIs and addresses
import { DAPP_TOKEN_ABI, LP_TOKEN_ABI, TOKEN_FARM_ABI, CONTRACT_ADDRESSES } from '../lib/contracts';

interface ContractInstances {
  dappToken?: ethers.Contract;
  lpToken?: ethers.Contract;
  tokenFarm?: ethers.Contract;
}

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>('');
  const [networkId, setNetworkId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [contracts, setContracts] = useState<ContractInstances>({});
  const [balances, setBalances] = useState({
    eth: '0',
    lp: '0',
    dapp: '0'
  });
  const [stakingInfo, setStakingInfo] = useState({
    staked: '0',
    pendingRewards: '0'
  });
  const [stakeAmount, setStakeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState<string>('');

  const log = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, newLog]);
    console.log(`[SimpleTokenFarm] ${message}`);
  }, []);

  const loadBalances = useCallback(async (userAccount: string) => {
    if (!provider || !contracts.lpToken || !contracts.dappToken) return;

    try {
      const [ethBalance, lpBalance, dappBalance] = await Promise.all([
        provider.getBalance(userAccount),
        contracts.lpToken.balanceOf(userAccount),
        contracts.dappToken.balanceOf(userAccount)
      ]);

      setBalances({
        eth: ethers.formatEther(ethBalance),
        lp: ethers.formatEther(lpBalance),
        dapp: ethers.formatEther(dappBalance)
      });
    } catch (error) {
      log(`❌ Error loading balances: ${error}`);
    }
  }, [provider, contracts.lpToken, contracts.dappToken, log]);

  const loadStakingInfo = useCallback(async (userAccount: string) => {
    if (!contracts.tokenFarm) return;

    try {
      const userInfo = await contracts.tokenFarm.users(userAccount);
      setStakingInfo({
        staked: ethers.formatEther(userInfo.stakingBalance),
        pendingRewards: ethers.formatEther(userInfo.pendingRewards)
      });
    } catch (error) {
      log(`❌ Error loading staking info: ${error}`);
    }
  }, [contracts.tokenFarm, log]);

  const setupContracts = useCallback(async (userAccount: string) => {
    try {
      if (!window.ethereum) {
        log('❌ MetaMask not available');
        return;
      }
      
      // Create provider from window.ethereum
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      setProvider(provider);

      // Get network
      const network = await provider.getNetwork();
      setNetworkId(network.chainId.toString());

      // Get signer
      const signer = await provider.getSigner();

      // Initialize contracts
      const dappToken = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.dappToken,
        DAPP_TOKEN_ABI,
        signer
      );

      const lpToken = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.lpToken,
        LP_TOKEN_ABI,
        signer
      );

      const tokenFarm = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.tokenFarm,
        TOKEN_FARM_ABI,
        signer
      );

      setContracts({ dappToken, lpToken, tokenFarm });

      // Load initial data
      await loadBalances(userAccount);
      await loadStakingInfo(userAccount);

      log('✅ Contracts initialized successfully');
    } catch (error) {
      log(`❌ Error setting up contracts: ${error}`);
    }
  }, [loadBalances, loadStakingInfo, log]);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount('');
      setIsConnected(false);
      log('❌ No accounts connected');
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      log(`✅ Wallet connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
      setupContracts(accounts[0]);
    }
  }, [log, setupContracts]);

  const handleChainChanged = useCallback((chainId: string) => {
    log(`🔄 Network changed to: ${chainId}`);
    setNetworkId(chainId);
    if (isConnected) {
      setupContracts(account);
    }
  }, [isConnected, account, log, setupContracts]);

  // Check if MetaMask is installed
  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        log('✅ MetaMask detected');
        
        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          handleAccountsChanged(accounts);
        }
      } else {
        log('❌ MetaMask not detected. Please install MetaMask.');
      }
    } catch (error) {
      log(`❌ Error checking wallet: ${error}`);
    }
  }, [log, handleAccountsChanged]);

  // Initialize on component mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  const connectWallet = async () => {
    try {
      setLoading(true);
      log('🔗 Connecting to MetaMask...');
      
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        handleAccountsChanged(accounts);
      } else {
        log('❌ MetaMask is not available');
      }
    } catch (error) {
      log(`❌ Error connecting wallet: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const stakeTokens = async () => {
    if (!contracts.lpToken || !contracts.tokenFarm || !stakeAmount) return;

    try {
      setLoading(true);
      const amount = ethers.parseEther(stakeAmount);
      
      // First approve tokens
      log('🔓 Approving LP tokens...');
      const approveTx = await contracts.lpToken.approve(contracts.tokenFarm.target, amount);
      await approveTx.wait();
      log('✅ LP tokens approved');

      // Then stake
      log('📥 Staking tokens...');
      const stakeTx = await contracts.tokenFarm.deposit(amount);
      await stakeTx.wait();
      log('✅ Tokens staked successfully');

      // Reload data
      await loadBalances(account);
      await loadStakingInfo(account);
      setStakeAmount('');
    } catch (error) {
      log(`❌ Error staking tokens: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    if (!contracts.tokenFarm) return;

    try {
      setLoading(true);
      log('🎁 Claiming rewards...');
      const claimTx = await contracts.tokenFarm.claimRewards();
      await claimTx.wait();
      log('✅ Rewards claimed successfully');

      // Reload data
      await loadBalances(account);
      await loadStakingInfo(account);
    } catch (error) {
      log(`❌ Error claiming rewards: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const withdrawTokens = async () => {
    if (!contracts.tokenFarm) return;

    try {
      setLoading(true);
      log('📤 Withdrawing tokens...');
      const withdrawTx = await contracts.tokenFarm.withdraw();
      await withdrawTx.wait();
      log('✅ Tokens withdrawn successfully');

      // Reload data
      await loadBalances(account);
      await loadStakingInfo(account);
    } catch (error) {
      log(`❌ Error withdrawing tokens: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const distributeRewards = async () => {
    if (!contracts.tokenFarm) return;

    try {
      setLoading(true);
      log('⏰ Distributing rewards...');
      const distributeTx = await contracts.tokenFarm.distributeRewardsAll();
      await distributeTx.wait();
      log('✅ Rewards distributed successfully');

      // Reload staking info
      await loadStakingInfo(account);
    } catch (error) {
      log(`❌ Error distributing rewards: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getNetworkName = (chainId: string) => {
    const networks: { [key: string]: string } = {
      '1': 'Ethereum Mainnet',
      '11155111': 'Sepolia Testnet',
      '5': 'Goerli Testnet',
      '137': 'Polygon Mainnet',
      '80001': 'Mumbai Testnet'
    };
    return networks[chainId] || `Network ${chainId}`;
  };

  const getNetworkColor = (chainId: string) => {
    const colors: { [key: string]: string } = {
      '1': 'bg-green-500',
      '11155111': 'bg-orange-500',
      '5': 'bg-purple-500',
      '137': 'bg-green-400',
      '80001': 'bg-orange-400'
    };
    return colors[chainId] || 'bg-gray-500';
  };

  const getEtherscanUrl = (address: string) => {
    return `https://sepolia.etherscan.io/address/${address}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with Epic Animation */}
        <div className="text-center mb-12">
          <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              🌟 Simple Token Farm
            </h1>
          </div>
          <p className="text-2xl text-gray-300 mb-6 animate-fade-in-up">
            DeFi Yield Farming Platform - Web3 Real
          </p>
          <div className="text-lg text-gray-400 animate-fade-in-up animation-delay-200">
            🎓 Universidad Cenfotec | 🌍 Ethereum Costa Rica
          </div>
          
          {/* Geek Style Badge */}
          <div className="mt-6 inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg transform hover:scale-110 transition-all duration-300 animate-bounce">
            🚀 BUILT WITH SOLIDITY & NEXT.JS
          </div>
        </div>

        {/* Enhanced Header with Wallet, Network & Tech Stack */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-8 mb-12 shadow-2xl transform hover:scale-105 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Wallet Connection Section */}
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold mb-4 text-blue-300 flex items-center justify-center lg:justify-start">
                <span className="mr-2">🔗</span>
                Wallet Status
              </h3>
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:transform-none shadow-lg animate-pulse"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      🔄 Connecting...
                    </span>
                  ) : (
                    '🔗 Connect Wallet'
                  )}
                </button>
              ) : (
                <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-lg p-4 inline-block shadow-lg transform hover:scale-105 transition-all duration-300">
                  <p className="text-sm text-green-200 mb-2">✅ Wallet Connected</p>
                  <p className="font-mono text-green-300 text-lg">{account.substring(0, 6)}...{account.substring(38)}</p>
                </div>
              )}
            </div>

            {/* Network Status Section */}
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-purple-300 flex items-center justify-center">
                <span className="mr-2">🌐</span>
                Network Status
              </h3>
              {networkId ? (
                <div className={`inline-block px-6 py-3 rounded-full text-white font-bold shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in-up ${getNetworkColor(networkId)}`}>
                  <span className="mr-2">🌐</span>
                  {getNetworkName(networkId)}
                </div>
              ) : (
                <div className="bg-gray-600 px-6 py-3 rounded-full text-white font-bold shadow-lg">
                  <span className="mr-2">⏳</span>
                  Detecting Network...
                </div>
              )}
            </div>

            {/* Tech Stack Section */}
            <div className="text-center lg:text-right">
              <h3 className="text-xl font-bold mb-4 text-cyan-300 flex items-center justify-center lg:justify-end">
                <span className="mr-2">⚡</span>
                Tech Stack
              </h3>
              <div className="flex flex-wrap justify-center lg:justify-end gap-2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  🔷 Solidity 0.8.22
                </span>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  ⚛️ Next.js 15
                </span>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  🔗 Ethers.js v6
                </span>
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  🦊 MetaMask
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Info with Verified Badges and Etherscan Links */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-8 mb-12 shadow-2xl transform hover:scale-105 transition-all duration-500">
          <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            📋 Verified Contracts on Sepolia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
              onMouseEnter={() => setIsHovered('dapp')}
              onMouseLeave={() => setIsHovered('')}
              onClick={() => window.open(getEtherscanUrl(CONTRACT_ADDRESSES.sepolia.dappToken), '_blank')}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-bold text-blue-300">DAppToken</p>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    ✅ Verified
                  </span>
                  <span className="text-blue-400 text-2xl">🔗</span>
                </div>
              </div>
              <p className="font-mono text-xs break-all text-blue-200 mb-3">
                {CONTRACT_ADDRESSES.sepolia.dappToken}
              </p>
              <div className="text-center">
                <span className="text-blue-300 text-sm">Click to view on Etherscan</span>
              </div>
            </div>

            <div 
              className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
              onMouseEnter={() => setIsHovered('lp')}
              onMouseLeave={() => setIsHovered('')}
              onClick={() => window.open(getEtherscanUrl(CONTRACT_ADDRESSES.sepolia.lpToken), '_blank')}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-bold text-green-300">LPToken</p>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    ✅ Verified
                  </span>
                  <span className="text-green-400 text-2xl">🔗</span>
                </div>
              </div>
              <p className="font-mono text-xs break-all text-green-200 mb-3">
                {CONTRACT_ADDRESSES.sepolia.lpToken}
              </p>
              <div className="text-center">
                <span className="text-green-300 text-sm">Click to view on Etherscan</span>
              </div>
            </div>

            <div 
              className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
              onMouseEnter={() => setIsHovered('farm')}
              onMouseLeave={() => setIsHovered('')}
              onClick={() => window.open(getEtherscanUrl(CONTRACT_ADDRESSES.sepolia.tokenFarm), '_blank')}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-bold text-purple-300">TokenFarm</p>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    ✅ Verified
                  </span>
                  <span className="text-purple-400 text-2xl">🔗</span>
                </div>
              </div>
              <p className="font-mono text-xs break-all text-purple-200 mb-3">
                {CONTRACT_ADDRESSES.sepolia.tokenFarm}
              </p>
              <div className="text-center">
                <span className="text-purple-300 text-sm">Click to view on Etherscan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balances with Hover Animations */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-800 to-blue-700 rounded-lg p-8 text-center transform hover:scale-110 transition-all duration-300 shadow-2xl animate-fade-in-up">
              <div className="text-4xl font-bold text-blue-300 mb-2">{balances.eth}</div>
              <div className="text-gray-300 text-lg">ETH</div>
              <div className="text-blue-400 text-sm mt-2">Native Token</div>
            </div>
            <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-lg p-8 text-center transform hover:scale-110 transition-all duration-300 shadow-2xl animate-fade-in-up animation-delay-200">
              <div className="text-4xl font-bold text-green-300 mb-2">{balances.lp}</div>
              <div className="text-gray-300 text-lg">LP Tokens</div>
              <div className="text-green-400 text-sm mt-2">Staking Token</div>
            </div>
            <div className="bg-gradient-to-br from-purple-800 to-purple-700 rounded-lg p-8 text-center transform hover:scale-110 transition-all duration-300 shadow-2xl animate-fade-in-up animation-delay-400">
              <div className="text-4xl font-bold text-purple-300 mb-2">{balances.dapp}</div>
              <div className="text-gray-300 text-lg">DAPP Tokens</div>
              <div className="text-purple-400 text-sm mt-2">Reward Token</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-800 to-yellow-700 rounded-lg p-8 text-center transform hover:scale-110 transition-all duration-300 shadow-2xl animate-fade-in-up animation-delay-600">
              <div className="text-4xl font-bold text-yellow-300 mb-2">{stakingInfo.staked}</div>
              <div className="text-gray-300 text-lg">Staked</div>
              <div className="text-yellow-400 text-sm mt-2">Total Staked</div>
            </div>
          </div>
        )}

        {/* Actions with Epic Hover Effects */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-lg p-6 transform hover:scale-105 transition-all duration-300 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-green-300">📥 Stake LP Tokens</h3>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Amount LPT"
                className="w-full bg-green-700 border border-green-600 rounded px-4 py-3 mb-4 text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
              />
              <button
                onClick={stakeTokens}
                disabled={loading || !stakeAmount}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-500 px-6 py-3 rounded font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {loading ? '🔄 Processing...' : '🚀 Stake'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-800 to-purple-700 rounded-lg p-6 transform hover:scale-105 transition-all duration-300 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-purple-300">🎁 Claim Rewards</h3>
              <p className="text-sm text-purple-200 mb-4">
                Rewards: <span className="font-bold text-purple-300">{stakingInfo.pendingRewards} DAPP</span>
              </p>
              <button
                onClick={claimRewards}
                disabled={loading || parseFloat(stakingInfo.pendingRewards) <= 0}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-500 px-6 py-3 rounded font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {loading ? '🔄 Processing...' : '💎 Claim DAPP'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-red-800 to-red-700 rounded-lg p-6 transform hover:scale-105 transition-all duration-300 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-red-300">📤 Withdraw</h3>
              <button
                onClick={withdrawTokens}
                disabled={loading || parseFloat(stakingInfo.staked) <= 0}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-500 px-6 py-3 rounded font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {loading ? '🔄 Processing...' : '⚡ Withdraw LPT'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-yellow-800 to-yellow-700 rounded-lg p-6 transform hover:scale-105 transition-all duration-300 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">⏰ Distribute Rewards</h3>
              <button
                onClick={distributeRewards}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-500 px-6 py-3 rounded font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {loading ? '🔄 Processing...' : '🌟 Distribute'}
              </button>
            </div>
          </div>
        )}

        {/* Console with Geek Style */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-8 shadow-2xl transform hover:scale-105 transition-all duration-500">
          <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            🖥️ Transaction Console
          </h3>
          <div className="bg-black rounded-lg p-6 h-80 overflow-y-auto border border-green-500 shadow-inner">
            {logs.map((log, index) => (
              <div key={index} className="text-green-400 font-mono text-sm mb-2 animate-fade-in-left">
                <span className="text-cyan-400">[</span>
                <span className="text-yellow-400">{index + 1}</span>
                <span className="text-cyan-400">]</span> {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500 text-center mt-20 animate-pulse">
                <div className="text-4xl mb-4">🖥️</div>
                <div>Console ready for transactions...</div>
                <div className="text-sm mt-2">Connect wallet to start</div>
              </div>
            )}
          </div>
        </div>

                 {/* Footer with Epic Style */}
         <div className="text-center mt-16 text-gray-400 animate-fade-in-up animation-delay-800">
           <div className="mb-4">
             <span className="text-2xl">🌟</span>
             <span className="text-xl font-bold mx-4">Simple Token Farm - Web3 Real</span>
             <span className="text-2xl">🌟</span>
           </div>
           <div className="text-lg">
             <span className="mr-4">🚀 Deployed on Vercel</span>
             <span className="mx-4">🔍 Contracts on Sepolia</span>
             <span className="ml-4">⚡ Built with Solidity</span>
           </div>
           
           {/* Project Links */}
           <div className="mt-6 flex justify-center space-x-4">
             <a 
               href="https://josegomez-dev.github.io/simple-token-farm/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
             >
               🎮 Demo Simulation
             </a>
             <a 
               href="https://github.com/josegomez-dev/simple-token-farm" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-full text-sm font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105"
             >
               📚 Source Code
             </a>
           </div>
         </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 0.4s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
