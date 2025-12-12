import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { web3Service } from '@/lib/web3';
import type { WalletState, BlockchainConfig } from '@shared/schema';

interface WalletContextType {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isConfigured: boolean;
  config: BlockchainConfig | null;
  setConfig: (config: BlockchainConfig) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    connected: false,
  });
  
  const [config, setConfigState] = useState<BlockchainConfig | null>(() => {
    const saved = localStorage.getItem('blockdag_config');
    return saved ? JSON.parse(saved) : null;
  });

  const setConfig = (newConfig: BlockchainConfig) => {
    setConfigState(newConfig);
    localStorage.setItem('blockdag_config', JSON.stringify(newConfig));
    web3Service.initialize(newConfig);
  };

  useEffect(() => {
    if (config) {
      web3Service.initialize(config);
    }
  }, [config]);

  useEffect(() => {
  console.log("Checking for MetaMask...");
  console.log("window.ethereum:", window.ethereum);
  console.log("Is MetaMask?", window.ethereum?.isMetaMask);
  
  if (!window.ethereum) {
    console.error("MetaMask not found! Make sure MetaMask extension is installed.");
    return;
  }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWallet(prev => ({
          ...prev,
          address: accounts[0],
          connected: true,
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWallet(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16),
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = async () => {
    try {
      const address = await web3Service.connectWallet();
      const chainId = await web3Service.getChainId();
      
      setWallet({
        address,
        chainId,
        connected: true,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setWallet({
      address: null,
      chainId: null,
      connected: false,
    });
  };

  const switchNetwork = async (chainId: number) => {
    try {
      await web3Service.switchNetwork(chainId);
      setWallet(prev => ({ ...prev, chainId }));
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connect,
        disconnect,
        switchNetwork,
        isConfigured: config !== null,
        config,
        setConfig,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}


