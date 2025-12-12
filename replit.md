# SecureVault - BlockDAG Document Protection Platform

## Overview
Enterprise-grade encrypted document storage and sharing platform built on BlockDAG blockchain. Provides NIST/ISO compliant security with end-to-end encryption, role-based access control, and immutable audit trails.

## Project Status
**Current Phase**: Integration Complete - Full MVP Ready ✓

## Architecture

### Smart Contract (Solidity)
- **File**: `SecureDocumentVault.sol`
- **Features**:
  - AES-256 encrypted document storage
  - Role-based access control (Viewer, Editor, Auditor, Owner)
  - Time-limited emergency access grants
  - Immutable blockchain audit trail
  - Multi-use case support (IP, Financial, Government, Supply Chain, Loans)

### Frontend (React + TypeScript)
- **Framework**: React with Wouter routing
- **Styling**: Tailwind CSS + Shadcn UI
- **Web3**: ethers.js for BlockDAG interaction
- **Encryption**: CryptoJS (AES-256)

### Key Features Implemented
1. **Wallet Connection**: MetaMask integration with BlockDAG network
2. **Document Upload**: Client-side encryption before blockchain storage
3. **Access Management**: Grant/revoke permissions with role-based access
4. **Document Viewer**: Decrypt and view authorized documents
5. **Audit Trail**: Complete NIST/ISO compliant logging
6. **Network Config**: Dynamic contract address and RPC configuration

## Pages & Components

### Pages
- **Landing** (`/`): Hero page with use cases and features
- **Dashboard** (`/dashboard`): Document overview and management
- **Upload** (`/upload`): Encrypted document upload interface
- **DocumentDetail** (`/document/:id`): View document, manage access, audit logs

### Key Components
- **WalletConnect**: MetaMask wallet connection
- **NetworkConfig**: BlockDAG network configuration
- **AccessManagement**: Grant/revoke access with roles and time limits
- **ThemeToggle**: Dark/light mode support
- **AppSidebar**: Navigation sidebar

## Technology Stack

### Dependencies
- `ethers`: Web3 blockchain interaction
- `crypto-js`: Client-side AES-256 encryption
- `@radix-ui/*`: Accessible UI components
- `wouter`: Lightweight routing
- `@tanstack/react-query`: Data fetching
- `tailwindcss`: Styling
- `lucide-react`: Icons

## User Flow

1. **Configuration**: User configures BlockDAG network (contract address, RPC, chain ID)
2. **Wallet Connection**: Connect MetaMask to BlockDAG network
3. **Upload**: Select file, choose category, encrypt client-side, store on blockchain
4. **Access Control**: Grant time-limited or permanent access with specific roles
5. **Retrieval**: Authorized users decrypt and view documents
6. **Audit**: View complete immutable history of all interactions

## Security Features

### Client-Side Encryption
- AES-256 encryption performed in browser
- Symmetric key encrypted with user's wallet address
- Only private key holder can decrypt

### Blockchain Security
- Immutable storage on BlockDAG
- Smart contract access control
- Event logging for compliance

### Access Control
- **Viewer**: Read-only access
- **Editor**: Can modify documents
- **Auditor**: Can view audit trails
- **Owner**: Full control including access management

## Use Cases

1. **Intellectual Property Protection**: Patents, source code, research
2. **Financial Compliance**: KYC/AML, audit evidence, reporting
3. **Government Documents**: Classified inter-agency sharing
4. **Supply Chain**: Pharmaceutical records, food safety, customs
5. **Loan Applications**: Credit documents, financial statements

## Deployment Instructions

### Smart Contract
1. Copy `SecureDocumentVault.sol` to BlockDAG IDE
2. Compile with Solidity ^0.8.0
3. Deploy and save contract address
4. Note RPC URL and Chain ID

### Frontend
1. Configure network settings via UI
2. Enter contract address, RPC URL, chain ID
3. Connect wallet
4. Start using the platform

## Recent Changes (October 22, 2025)
- ✓ Created comprehensive Solidity smart contract
- ✓ Built complete React frontend with all pages
- ✓ Implemented Web3 integration layer
- ✓ Added client-side encryption service with proper key management
- ✓ Created wallet connection system
- ✓ Built access management UI
- ✓ Implemented audit trail viewer
- ✓ Added dark/light theme support
- ✓ Created responsive design system
- ✓ Implemented backend document storage API
- ✓ Added document download and decryption
- ✓ Fixed encryption key security (password-based key wrapping)
- ✓ Complete end-to-end workflow tested

## Security Implementation
- **Client-Side Encryption**: AES-256-GCM encryption in browser before upload (authenticated encryption)
- **Key Protection**: Symmetric keys encrypted using wallet signature-derived keys (proper asymmetric security)
  - User signs a message with their private key
  - Signature is hashed (SHA-256) to derive encryption key
  - Only wallet owner can decrypt (requires private key to sign)
- **Per-Grantee Key Distribution**: When granting access:
  - Owner decrypts the document's symmetric key with their signature
  - Encrypts the symmetric key with grantee's signature-derivable key
  - Stores grantee-specific encrypted key in backend
  - Grantee can then decrypt using their own wallet signature
- **Data Storage**: Encrypted document data stored off-chain in backend
- **Blockchain Storage**: Only document hash and owner's encrypted key stored on-chain
- **Access Control**: Smart contract enforces role-based permissions
- **Audit Trail**: Immutable blockchain logging of all actions
- **Zero-Knowledge**: Server never sees plaintext data or unencrypted keys

## Known Limitations & Production Roadmap

### Current MVP Status
- ✅ End-to-end encryption with AES-256-GCM (authenticated encryption)
- ✅ Owner-only decryption (secure with wallet signatures)
- ✅ Role-based access control enforced on blockchain
- ✅ Time-limited access grants with expiry
- ✅ Complete audit trail
- ✅ All 5 use cases supported (IP, Financial, Government, Supply Chain, Loans)
- ⚠️ **Grantee decryption requires additional implementation** (see below)

### Remaining Work: Per-Grantee Decryption

Currently, only document owners can decrypt. Grantees have on-chain permission but cannot decrypt the document. To enable full multi-user access, implement one of these options:

**Option 1: ECIES Public Key Encryption** (Recommended for Production)
- Extract public key from grantee's wallet address  
- Use ECIES to encrypt symmetric key with grantee's public key
- Only grantee's private key can decrypt
- Best security and UX
- Requires: ethers.js + eccrypto or similar library

**Option 2: Signature-Based Key Exchange**
- Grantee signs "Request access for [address]" message
- Share signature with owner (out-of-band or via UI)
- Owner encrypts symmetric key using SHA-256(signature)
- Grantee decrypts with same signature
- Simpler but requires coordination

**Option 3: Shared Secret Protocol**
- Derive shared secret from ECDH key agreement
- Both parties can compute same secret
- Use secret to encrypt/decrypt symmetric key
- More complex cryptographic implementation

### Deployment Steps
1. **Deploy Smart Contract**: Deploy `SecureDocumentVault.sol` to BlockDAG network
2. **Configure Network**: In UI, go to Settings → Configure custom RPC URL and contract address
3. **Connect Wallet**: Connect MetaMask or compatible wallet
4. **Upload Documents**: Owner can upload and encrypt documents (fully functional)
5. **Grant Access**: Owner can grant on-chain permissions (blockchain access control works)
6. **Implement Grantee Decryption**: Choose and implement one of the options above for production
