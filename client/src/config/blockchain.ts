// client/src/config/blockchain.ts
// Update the RPC_URL to use a public endpoint (no API key needed)
// client/src/config/blockchain.ts
export const BLOCKCHAIN_CONFIG = {
  // YOUR REAL DEPLOYED CONTRACT ADDRESS
  CONTRACT_ADDRESS: "0xd9145CCE52D386f254917e481eB44e9943F39138",
  
  // Using Sepolia testnet with public RPC
  NETWORK_ID: 11155111,
  NETWORK_NAME: "Sepolia Testnet",
  RPC_URL: "https://rpc2.sepolia.org", // Public RPC
  CHAIN_ID: "0xaa36a7",
};

// Contract ABI
export const CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "documentId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "grantee",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "enum SecureDocumentVault.Role",
                "name": "role",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "expiresAt",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "grantedBy",
                "type": "address"
            }
        ],
        "name": "AccessGranted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "documentId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "grantee",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "revokedBy",
                "type": "address"
            }
        ],
        "name": "AccessRevoked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "documentId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "actor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "action",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "AuditLogEntry",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "documentId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "accessor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "DocumentAccessed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "documentId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "enum SecureDocumentVault.DocumentCategory",
                "name": "category",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "DocumentStored",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getAccessGrant",
        "outputs": [
            {
                "internalType": "enum SecureDocumentVault.Role",
                "name": "role",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "grantedAt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "expiresAt",
                "type": "uint256"
            },
            {
                "internalType": "enum SecureDocumentVault.AccessStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "grantedBy",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentId",
                "type": "bytes32"
            }
        ],
        "name": "getAllGrantees",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentId",
                "type": "bytes32"
            }
        ],
        "name": "getDocument",
        "outputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "encryptedDataHash",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "encryptedSymmetricKey",
                "type": "string"
            },
            {
                "internalType": "enum SecureDocumentVault.DocumentCategory",
                "name": "category",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "metadata",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentId",
                "type": "bytes32"
            }
        ],
        "name": "getDocumentAuditLog",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "actors",
                "type": "address[]"
            },
            {
                "internalType": "string[]",
                "name": "actions",
                "type": "string[]"
            },
            {
                "internalType": "uint256[]",
                "name": "timestamps",
                "type": "uint256[]"
            },
            {
                "internalType": "string[]",
                "name": "details",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDocumentCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getUserDocuments",
        "outputs": [
            {
                "internalType": "bytes32[]",
                "name": "",
                "type": "bytes32[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "_grantee",
                "type": "address"
            },
            {
                "internalType": "enum SecureDocumentVault.Role",
                "name": "_role",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "_durationInSeconds",
                "type": "uint256"
            }
        ],
        "name": "grantAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "_grantee",
                "type": "address"
            }
        ],
        "name": "revokeAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_encryptedDataHash",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_encryptedSymmetricKey",
                "type": "string"
            },
            {
                "internalType": "enum SecureDocumentVault.DocumentCategory",
                "name": "_category",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "_metadata",
                "type": "string"
            }
        ],
        "name": "storeDocument",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_documentId",
                "type": "bytes32"
            },
            {
                "internalType": "string",
                "name": "_encryptedDataHash",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_encryptedSymmetricKey",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_metadata",
                "type": "string"
            }
        ],
        "name": "updateDocument",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];


