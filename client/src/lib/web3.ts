import { ethers } from "ethers";
import type { BlockchainConfig } from "@shared/schema";
import { BLOCKCHAIN_CONFIG } from "@/config/blockchain";

const CONTRACT_ABI = [
  "function storeDocument(string memory _encryptedDataHash, string memory _encryptedSymmetricKey, uint8 _category, string memory _metadata) external returns (bytes32)",
  "function grantAccess(bytes32 _documentId, address _grantee, uint8 _role, uint256 _durationInSeconds) external",
  "function revokeAccess(bytes32 _documentId, address _grantee) external",
  "function getDocument(bytes32 _documentId) external returns (address owner, string memory encryptedDataHash, string memory encryptedSymmetricKey, uint8 category, uint256 timestamp, string memory metadata)",
  "function updateDocument(bytes32 _documentId, string memory _encryptedDataHash, string memory _encryptedSymmetricKey, string memory _metadata) external",
  "function getAccessGrant(bytes32 _documentId, address _user) external view returns (uint8 role, uint256 grantedAt, uint256 expiresAt, uint8 status, address grantedBy)",
  "function getAllGrantees(bytes32 _documentId) external view returns (address[] memory)",
  "function getUserDocuments(address _user) external view returns (bytes32[] memory)",
  "function getDocumentAuditLog(bytes32 _documentId) external view returns (address[] memory actors, string[] memory actions, uint256[] memory timestamps, string[] memory details)",
  "function getDocumentCount() external view returns (uint256)",
  "event DocumentStored(bytes32 indexed documentId, address indexed owner, uint8 category, uint256 timestamp)",
  "event AccessGranted(bytes32 indexed documentId, address indexed grantee, uint8 role, uint256 expiresAt, address indexed grantedBy)",
  "event AccessRevoked(bytes32 indexed documentId, address indexed grantee, address indexed revokedBy)",
  "event DocumentAccessed(bytes32 indexed documentId, address indexed accessor, uint256 timestamp)",    
  "event AuditLogEntry(bytes32 indexed documentId, address indexed actor, string action, uint256 timestamp)"
];

// Default config using our blockchain.ts config
const defaultConfig: BlockchainConfig = {
  contractAddress: BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
  networkId: BLOCKCHAIN_CONFIG.NETWORK_ID,
  networkName: BLOCKCHAIN_CONFIG.NETWORK_NAME,
  rpcUrl: BLOCKCHAIN_CONFIG.RPC_URL,
  chainId: BLOCKCHAIN_CONFIG.CHAIN_ID,
};

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private config: BlockchainConfig;
  private readOnlyContract: ethers.Contract | null = null;

  constructor(initialConfig?: BlockchainConfig) {
    console.log("?? Web3Service initializing...");
    console.log("Contract address:", BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS);
    
    // Use provided config or default config
    this.config = initialConfig || defaultConfig;
    
    // ALWAYS create a read-only contract instance, even without wallet
    if (this.config.contractAddress && this.config.contractAddress !== "0x1234567890123456789012345678901234567890") {
      console.log("?? Creating read-only contract instance...");
      
      // Create a provider for the network (read-only, no wallet needed)
      const networkProvider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      this.readOnlyContract = new ethers.Contract(
        this.config.contractAddress, 
        CONTRACT_ABI, 
        networkProvider
      );
      
      console.log("? Read-only contract created");
    } else {
      console.warn("?? Using dummy contract address - replace with real deployed address");
    }
    
    // If MetaMask is available, also set up wallet-connected contract
    if (window.ethereum) {
      console.log("?? MetaMask detected, setting up wallet connection");
      this.setupWalletContract();
    }
  }

  private async setupWalletContract() {
    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(this.config.contractAddress, CONTRACT_ABI, signer);
      console.log("? Wallet-connected contract ready");
    } catch (error) {
      console.log("?? Wallet contract setup failed (wallet may not be connected):", error.message);
    }
  }

  async initialize(config: BlockchainConfig) {
    console.log("Web3Service.initialize called");
    this.config = config;
    
    // Recreate read-only contract with new config
    if (config.contractAddress) {
      const networkProvider = new ethers.JsonRpcProvider(config.rpcUrl);
      this.readOnlyContract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, networkProvider);
    }
    
    await this.setupWalletContract();
  }

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await this.provider.send("eth_requestAccounts", []);
    
    // Setup wallet-connected contract
    const signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(this.config.contractAddress, CONTRACT_ABI, signer);
    console.log("? Wallet connected and contract initialized");

    return accounts[0];
  }

  async getAddress(): Promise<string | null> {
    if (!this.provider) return null;
    const signer = await this.provider.getSigner();
    return await signer.getAddress();
  }

  async getChainId(): Promise<number | null> {
    if (!this.provider) return null;
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) throw new Error("MetaMask not installed");

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error("Network not added to MetaMask. Please add it manually.");
      }
      throw error;
    }
  }

  getContract(): ethers.Contract {
    // Return wallet-connected contract if available, otherwise read-only contract
    if (this.contract) {
      return this.contract;
    } else if (this.readOnlyContract) {
      console.log("?? Using read-only contract (wallet not connected)");
      return this.readOnlyContract;
    } else {
      throw new Error("Contract not initialized. Check contract address configuration.");
    }
  }

  isConnected(): boolean {
    return this.provider !== null && this.contract !== null;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) throw new Error("Provider not initialized");
    const signer = await this.provider.getSigner();
    return await signer.signMessage(message);
  }
}

export const web3Service = new Web3Service();

declare global {
  interface Window {
    ethereum?: any;
    web3Service?: Web3Service;
  }
}

// Make web3Service available globally for debugging
if (typeof window !== 'undefined') {
  window.web3Service = web3Service;
}
