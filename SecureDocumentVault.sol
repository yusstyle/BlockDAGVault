// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SecureDocumentVault
 * @dev NIST/ISO compliant encrypted document storage and access control system for BlockDAG
 * @notice Supports: IP Protection, Financial Compliance, Government Documents, Supply Chain, Loan Applications
 */
contract SecureDocumentVault {
    
    enum Role { NONE, VIEWER, EDITOR, AUDITOR, OWNER }
    enum DocumentCategory { IP_PROTECTION, FINANCIAL_COMPLIANCE, GOVERNMENT, SUPPLY_CHAIN, LOAN_APPLICATION }
    enum AccessStatus { ACTIVE, REVOKED, EXPIRED }
    
    struct Document {
        bytes32 documentId;
        address owner;
        string encryptedDataHash;
        string encryptedSymmetricKey;
        DocumentCategory category;
        uint256 timestamp;
        bool exists;
        string metadata;
    }
    
    struct AccessGrant {
        address grantee;
        Role role;
        uint256 grantedAt;
        uint256 expiresAt;
        AccessStatus status;
        address grantedBy;
    }
    
    struct AuditEntry {
        bytes32 documentId;
        address actor;
        string action;
        uint256 timestamp;
        string details;
    }
    
    mapping(bytes32 => Document) private documents;
    mapping(bytes32 => mapping(address => AccessGrant)) private accessControl;
    mapping(bytes32 => address[]) private documentGrantees;
    mapping(address => bytes32[]) private userDocuments;
    
    AuditEntry[] private auditLog;
    mapping(bytes32 => uint256[]) private documentAuditIndices;
    
    uint256 private documentCount;
    
    event DocumentStored(
        bytes32 indexed documentId,
        address indexed owner,
        DocumentCategory category,
        uint256 timestamp
    );
    
    event AccessGranted(
        bytes32 indexed documentId,
        address indexed grantee,
        Role role,
        uint256 expiresAt,
        address indexed grantedBy
    );
    
    event AccessRevoked(
        bytes32 indexed documentId,
        address indexed grantee,
        address indexed revokedBy
    );
    
    event DocumentAccessed(
        bytes32 indexed documentId,
        address indexed accessor,
        uint256 timestamp
    );
    
    event AuditLogEntry(
        bytes32 indexed documentId,
        address indexed actor,
        string action,
        uint256 timestamp
    );
    
    modifier onlyDocumentOwner(bytes32 _documentId) {
        require(documents[_documentId].exists, "Document does not exist");
        require(documents[_documentId].owner == msg.sender, "Not document owner");
        _;
    }
    
    modifier hasAccess(bytes32 _documentId, Role _minimumRole) {
        require(documents[_documentId].exists, "Document does not exist");
        require(
            _checkAccess(_documentId, msg.sender, _minimumRole),
            "Access denied"
        );
        _;
    }
    
    function storeDocument(
        string memory _encryptedDataHash,
        string memory _encryptedSymmetricKey,
        DocumentCategory _category,
        string memory _metadata
    ) external returns (bytes32) {
        bytes32 documentId = keccak256(
            abi.encodePacked(
                msg.sender,
                _encryptedDataHash,
                block.timestamp,
                documentCount
            )
        );
        
        require(!documents[documentId].exists, "Document already exists");
        
        documents[documentId] = Document({
            documentId: documentId,
            owner: msg.sender,
            encryptedDataHash: _encryptedDataHash,
            encryptedSymmetricKey: _encryptedSymmetricKey,
            category: _category,
            timestamp: block.timestamp,
            exists: true,
            metadata: _metadata
        });
        
        accessControl[documentId][msg.sender] = AccessGrant({
            grantee: msg.sender,
            role: Role.OWNER,
            grantedAt: block.timestamp,
            expiresAt: 0,
            status: AccessStatus.ACTIVE,
            grantedBy: msg.sender
        });
        
        userDocuments[msg.sender].push(documentId);
        documentGrantees[documentId].push(msg.sender);
        documentCount++;
        
        _addAuditEntry(
            documentId,
            msg.sender,
            "DOCUMENT_CREATED",
            string(abi.encodePacked("Category: ", _uintToString(uint256(_category))))
        );
        
        emit DocumentStored(documentId, msg.sender, _category, block.timestamp);
        
        return documentId;
    }
    
    function grantAccess(
        bytes32 _documentId,
        address _grantee,
        Role _role,
        uint256 _durationInSeconds
    ) external onlyDocumentOwner(_documentId) {
        require(_grantee != address(0), "Invalid grantee address");
        require(_role != Role.NONE && _role != Role.OWNER, "Invalid role");
        require(
            accessControl[_documentId][_grantee].status != AccessStatus.ACTIVE,
            "Access already granted"
        );
        
        uint256 expiresAt = _durationInSeconds > 0 
            ? block.timestamp + _durationInSeconds 
            : 0;
        
        accessControl[_documentId][_grantee] = AccessGrant({
            grantee: _grantee,
            role: _role,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            status: AccessStatus.ACTIVE,
            grantedBy: msg.sender
        });
        
        bool isNewGrantee = true;
        for (uint256 i = 0; i < documentGrantees[_documentId].length; i++) {
            if (documentGrantees[_documentId][i] == _grantee) {
                isNewGrantee = false;
                break;
            }
        }
        if (isNewGrantee) {
            documentGrantees[_documentId].push(_grantee);
        }
        
        _addAuditEntry(
            _documentId,
            msg.sender,
            "ACCESS_GRANTED",
            string(abi.encodePacked(
                "Grantee: ",
                _addressToString(_grantee),
                ", Role: ",
                _roleToString(_role),
                ", Duration: ",
                _uintToString(_durationInSeconds),
                "s"
            ))
        );
        
        emit AccessGranted(_documentId, _grantee, _role, expiresAt, msg.sender);
    }
    
    function revokeAccess(bytes32 _documentId, address _grantee) 
        external 
        onlyDocumentOwner(_documentId) 
    {
        require(
            accessControl[_documentId][_grantee].status == AccessStatus.ACTIVE,
            "No active access to revoke"
        );
        require(_grantee != documents[_documentId].owner, "Cannot revoke owner access");
        
        accessControl[_documentId][_grantee].status = AccessStatus.REVOKED;
        
        _addAuditEntry(
            _documentId,
            msg.sender,
            "ACCESS_REVOKED",
            string(abi.encodePacked("Grantee: ", _addressToString(_grantee)))
        );
        
        emit AccessRevoked(_documentId, _grantee, msg.sender);
    }
    
    function getDocument(bytes32 _documentId) 
        external 
        hasAccess(_documentId, Role.VIEWER)
        returns (
            address owner,
            string memory encryptedDataHash,
            string memory encryptedSymmetricKey,
            DocumentCategory category,
            uint256 timestamp,
            string memory metadata
        )
    {
        Document storage doc = documents[_documentId];
        
        _addAuditEntry(
            _documentId,
            msg.sender,
            "DOCUMENT_ACCESSED",
            ""
        );
        
        emit DocumentAccessed(_documentId, msg.sender, block.timestamp);
        
        return (
            doc.owner,
            doc.encryptedDataHash,
            doc.encryptedSymmetricKey,
            doc.category,
            doc.timestamp,
            doc.metadata
        );
    }
    
    function updateDocument(
        bytes32 _documentId,
        string memory _encryptedDataHash,
        string memory _encryptedSymmetricKey,
        string memory _metadata
    ) external hasAccess(_documentId, Role.EDITOR) {
        Document storage doc = documents[_documentId];
        
        doc.encryptedDataHash = _encryptedDataHash;
        doc.encryptedSymmetricKey = _encryptedSymmetricKey;
        doc.metadata = _metadata;
        
        _addAuditEntry(
            _documentId,
            msg.sender,
            "DOCUMENT_UPDATED",
            ""
        );
    }
    
    function getAccessGrant(bytes32 _documentId, address _user)
        external
        view
        returns (
            Role role,
            uint256 grantedAt,
            uint256 expiresAt,
            AccessStatus status,
            address grantedBy
        )
    {
        AccessGrant storage grant = accessControl[_documentId][_user];
        return (
            grant.role,
            grant.grantedAt,
            grant.expiresAt,
            grant.status,
            grant.grantedBy
        );
    }
    
    function getAllGrantees(bytes32 _documentId)
        external
        view
        onlyDocumentOwner(_documentId)
        returns (address[] memory)
    {
        return documentGrantees[_documentId];
    }
    
    function getUserDocuments(address _user)
        external
        view
        returns (bytes32[] memory)
    {
        return userDocuments[_user];
    }
    
    function getDocumentAuditLog(bytes32 _documentId)
        external
        view
        hasAccess(_documentId, Role.AUDITOR)
        returns (
            address[] memory actors,
            string[] memory actions,
            uint256[] memory timestamps,
            string[] memory details
        )
    {
        uint256[] storage indices = documentAuditIndices[_documentId];
        uint256 length = indices.length;
        
        actors = new address[](length);
        actions = new string[](length);
        timestamps = new uint256[](length);
        details = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            AuditEntry storage entry = auditLog[indices[i]];
            actors[i] = entry.actor;
            actions[i] = entry.action;
            timestamps[i] = entry.timestamp;
            details[i] = entry.details;
        }
        
        return (actors, actions, timestamps, details);
    }
    
    function getDocumentCount() external view returns (uint256) {
        return documentCount;
    }
    
    function _checkAccess(
        bytes32 _documentId,
        address _user,
        Role _minimumRole
    ) private view returns (bool) {
        AccessGrant storage grant = accessControl[_documentId][_user];
        
        if (grant.status != AccessStatus.ACTIVE) {
            return false;
        }
        
        if (grant.expiresAt > 0 && block.timestamp > grant.expiresAt) {
            return false;
        }
        
        if (uint256(grant.role) < uint256(_minimumRole)) {
            return false;
        }
        
        return true;
    }
    
    function _addAuditEntry(
        bytes32 _documentId,
        address _actor,
        string memory _action,
        string memory _details
    ) private {
        uint256 index = auditLog.length;
        
        auditLog.push(AuditEntry({
            documentId: _documentId,
            actor: _actor,
            action: _action,
            timestamp: block.timestamp,
            details: _details
        }));
        
        documentAuditIndices[_documentId].push(index);
        
        emit AuditLogEntry(_documentId, _actor, _action, block.timestamp);
    }
    
    function _roleToString(Role _role) private pure returns (string memory) {
        if (_role == Role.VIEWER) return "VIEWER";
        if (_role == Role.EDITOR) return "EDITOR";
        if (_role == Role.AUDITOR) return "AUDITOR";
        if (_role == Role.OWNER) return "OWNER";
        return "NONE";
    }
    
    function _uintToString(uint256 _value) private pure returns (string memory) {
        if (_value == 0) {
            return "0";
        }
        uint256 temp = _value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (_value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(_value % 10)));
            _value /= 10;
        }
        return string(buffer);
    }
    
    function _addressToString(address _addr) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
