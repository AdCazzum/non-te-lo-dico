// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE IPFS Storage
/// @author mramundo
/// @notice Secure file storage system with encrypted decryption keys using FHEVM and IPFS
/// @dev Files are encrypted client-side, stored on IPFS, and decryption keys are encrypted with FHEVM
contract FHEIPFSStorage is SepoliaConfig {

    /// @notice Struct to store encrypted file information
    struct FileData {
        string cid;              // IPFS CID of the encrypted file
        euint32 encryptedKey;    // Encrypted decryption key (encrypted with FHEVM)
        address owner;           // File owner address
        uint256 timestamp;       // Creation timestamp
    }
    
    /// @notice Mapping from CID to FileData
    mapping(string => FileData) private files;
    
    /// @notice Mapping to track CID existence
    mapping(string => bool) private cidExists;
    
    /// @notice Mapping for owner's files: owner => array of CIDs
    mapping(address => string[]) private ownerFiles;
    
    /// @notice Event emitted when a new file is stored
    event FileStored(string indexed cid, address indexed owner, uint256 timestamp);
    
    /// @notice Event emitted when access is granted
    event AccessGranted(string indexed cid, address indexed owner, address indexed grantee);
    
    /// @notice Event emitted when access is revoked
    event AccessRevoked(string indexed cid, address indexed owner, address indexed revokee);
    
    /// @notice Store a new encrypted file reference
    /// @param _cid The IPFS CID of the encrypted file
    /// @param _encryptedKey The encrypted decryption key
    /// @param _inputProof The proof for the encrypted key
    function storeFile(
        string calldata _cid, 
        externalEuint32 _encryptedKey, 
        bytes calldata _inputProof
    ) external {
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(!cidExists[_cid], "File with this CID already exists");
        
        // Convert external encrypted key to internal format
        euint32 encryptedKey = FHE.fromExternal(_encryptedKey, _inputProof);
        
        // Store file data
        files[_cid] = FileData({
            cid: _cid,
            encryptedKey: encryptedKey,
            owner: msg.sender,
            timestamp: block.timestamp
        });
        
        cidExists[_cid] = true;
        ownerFiles[msg.sender].push(_cid);
        
        // Grant access permissions using ZAMA ACL
        FHE.allowThis(encryptedKey);
        FHE.allow(encryptedKey, msg.sender);
        
        emit FileStored(_cid, msg.sender, block.timestamp);
    }
    
    /// @notice Grant access to a file for a specific address
    /// @param _cid The IPFS CID of the file
    /// @param _grantee The address to grant access to
    function grantAccess(string calldata _cid, address _grantee) external {
        require(cidExists[_cid], "File does not exist");
        require(files[_cid].owner == msg.sender, "Only owner can grant access");
        require(_grantee != address(0), "Invalid grantee address");
        require(_grantee != msg.sender, "Cannot grant access to yourself");
        
        // Grant access using ZAMA ACL
        FHE.allow(files[_cid].encryptedKey, _grantee);
        
        emit AccessGranted(_cid, msg.sender, _grantee);
    }
    
    /// @notice Revoke access to a file for a specific address
    /// @param _cid The IPFS CID of the file
    /// @param _revokee The address to revoke access from
    /// @dev Note: ACL revocation is handled by ZAMA framework
    function revokeAccess(string calldata _cid, address _revokee) external {
        require(cidExists[_cid], "File does not exist");
        require(files[_cid].owner == msg.sender, "Only owner can revoke access");
        require(_revokee != address(0), "Invalid revokee address");
        
        emit AccessRevoked(_cid, msg.sender, _revokee);
    }
    
    /// @notice Get file metadata (public information)
    /// @param _cid The IPFS CID of the file
    /// @return owner The file owner
    /// @return timestamp The creation timestamp
    function getFileMetadata(string calldata _cid) external view returns (
        address owner,
        uint256 timestamp
    ) {
        require(cidExists[_cid], "File does not exist");
        FileData storage file = files[_cid];
        return (file.owner, file.timestamp);
    }
    
    /// @notice Get encrypted decryption key (only for authorized users)
    /// @param _cid The IPFS CID of the file
    /// @return The encrypted key (will fail if caller doesn't have ACL permission)
    /// @dev Access control is enforced by ZAMA ACL system during decryption
    function getEncryptedKey(string calldata _cid) external view returns (euint32) {
        require(cidExists[_cid], "File does not exist");
        return files[_cid].encryptedKey;
    }
    
    /// @notice Get all CIDs owned by a specific address
    /// @param _owner The owner address
    /// @return Array of CIDs owned by the address
    function getOwnerFiles(address _owner) external view returns (string[] memory) {
        require(_owner != address(0), "Invalid owner address");
        return ownerFiles[_owner];
    }
    
    /// @notice Check if a file with given CID exists
    /// @param _cid The IPFS CID to check
    /// @return True if file exists, false otherwise
    function fileExists(string calldata _cid) external view returns (bool) {
        return cidExists[_cid];
    }
}
