# BlockDAG Deployment Instructions

## Solidity Contract: SecureDocumentVault.sol

### Features Implemented

✅ **Encrypted Document Storage**: Documents are stored with encrypted data hashes and encrypted symmetric keys
✅ **Role-Based Access Control**: VIEWER, EDITOR, AUDITOR, OWNER roles
✅ **Time-Limited Access Grants**: Emergency access with automatic expiration
✅ **Multi-Use Case Support**: IP Protection, Financial Compliance, Government, Supply Chain, Loan Applications
✅ **Immutable Audit Trail**: Complete NIST/ISO compliant logging of all actions
✅ **Owner-Only Access Control**: Only document owners can grant/revoke permissions
✅ **Access Expiration**: Automatic expiration checking for time-limited grants

### Deployment Steps

1. **Open BlockDAG IDE** at your BlockDAG network interface

2. **Create New Contract**
   - Copy the entire contents of `SecureDocumentVault.sol`
   - Paste into BlockDAG IDE

3. **Compile Contract**
   - Ensure Solidity version ^0.8.0 is selected
   - Click "Compile"
   - Verify no errors

4. **Deploy Contract**
   - Click "Deploy"
   - Confirm transaction in your wallet
   - Wait for deployment confirmation

5. **Copy Contract Details**
   After deployment, you'll receive:
   - **Contract Address**: `0x...` (copy this)
   - **Network RPC URL**: The BlockDAG RPC endpoint
   - **Chain ID**: BlockDAG network chain ID
   
6. **Provide to Frontend**
   You'll need to provide these values:
   ```
   CONTRACT_ADDRESS=0x...
   RPC_URL=https://...
   CHAIN_ID=...
   ```

### Contract Functions Overview

**Document Management:**
- `storeDocument()` - Upload encrypted document
- `getDocument()` - Retrieve encrypted document (requires access)
- `updateDocument()` - Update document (requires EDITOR role)

**Access Control:**
- `grantAccess()` - Grant role-based access with optional expiration
- `revokeAccess()` - Revoke user access
- `getAccessGrant()` - Check access permissions
- `getAllGrantees()` - List all users with access

**Audit & Compliance:**
- `getDocumentAuditLog()` - Retrieve complete audit trail (requires AUDITOR role)
- `getUserDocuments()` - List user's documents

### Next Steps

Once deployed, provide the contract address and RPC details, and the frontend will be ready to interact with your BlockDAG contract immediately!
