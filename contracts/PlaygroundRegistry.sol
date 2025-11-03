// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Somnia Playground Registry
/// @notice Logs contracts deployed through the playground and provides simple treasury hooks
contract PlaygroundRegistry {
    struct DeploymentInfo {
        address deployer;
        address contractAddress;
        uint64  timestamp;
        uint64  chainId;
        string  metadataURI; // optional off-chain metadata pointer
    }

    /// @dev Emitted whenever a new deployment is registered
    event DeploymentRegistered(
        address indexed deployer,
        address indexed contractAddress,
        uint64 indexed chainId,
        string metadataURI
    );

    /// @dev Emitted on treasury actions for simple audit tagging
    event TreasuryPing(address indexed treasury, address indexed contractAddress, bytes32 tag);

    address public immutable treasury;

    DeploymentInfo[] private _deployments;
    mapping(address => uint256) public contractIndex; // 1-based index, 0 = not present

    modifier onlyTreasury() {
        require(msg.sender == treasury, "ONLY_TREASURY");
        _;
    }

    constructor(address treasuryAddress) {
        require(treasuryAddress != address(0), "TREASURY_REQUIRED");
        treasury = treasuryAddress;
    }

    /// @notice Register a deployed contract
    /// @param deployedContract Address of the deployed contract
    /// @param metadataURI Optional URI with additional metadata (can be empty)
    function registerDeployment(address deployedContract, string calldata metadataURI) external {
        require(deployedContract != address(0), "INVALID_CONTRACT");
        require(contractIndex[deployedContract] == 0, "ALREADY_REGISTERED");

        DeploymentInfo memory info = DeploymentInfo({
            deployer: msg.sender,
            contractAddress: deployedContract,
            timestamp: uint64(block.timestamp),
            chainId: uint64(block.chainid),
            metadataURI: metadataURI
        });

        _deployments.push(info);
        contractIndex[deployedContract] = _deployments.length; // 1-based

        emit DeploymentRegistered(msg.sender, deployedContract, uint64(block.chainid), metadataURI);
    }

    /// @notice A simple treasury hook to annotate or trigger actions off-chain
    function treasuryPing(address deployedContract, bytes32 tag) external onlyTreasury {
        require(deployedContract != address(0), "INVALID_CONTRACT");
        emit TreasuryPing(msg.sender, deployedContract, tag);
    }

    /// @notice Get number of registered deployments
    function totalDeployments() external view returns (uint256) {
        return _deployments.length;
    }

    /// @notice Paginate through deployments
    function getDeployments(uint256 offset, uint256 limit) external view returns (DeploymentInfo[] memory page) {
        uint256 n = _deployments.length;
        if (offset >= n) return new DeploymentInfo[](0);
        uint256 end = offset + limit;
        if (end > n) end = n;
        uint256 len = end - offset;
        page = new DeploymentInfo[](len);
        for (uint256 i = 0; i < len; i++) {
            page[i] = _deployments[offset + i];
        }
    }

    /// @notice Look up deployment info by contract address
    function getDeployment(address deployedContract) external view returns (DeploymentInfo memory info, bool found) {
        uint256 idx = contractIndex[deployedContract];
        if (idx == 0) return (info, false);
        return (_deployments[idx - 1], true);
    }
}


