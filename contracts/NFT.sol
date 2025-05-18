// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ERC721Enumerable.sol";
import "./Ownable.sol";
import "./Strings.sol";

// Inherit from ERC721Enumerable
contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
    string public baseURI;
    string public baseExtension = '.json';
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public maxMintAmount = 5;
    uint256 public allowMintingOn;

    // whitelist mapping
    mapping(address => bool) public whitelist;
    //bool public whitelistMintEnabled = false;
    bool public whitelistOnly = true;

    event Mint(uint256 amount, address indexed minter);
    event Withdraw(uint256 amount, address owner);
    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);
    event WhitelistOnlyChanged(bool indexed whitelistOnly);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI
    ) ERC721(_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
        allowMintingOn = _allowMintingOn;
        baseURI = _baseURI;
    }

    function mint(uint256 _mintAmount) public payable {
        // Only allow minting after specified time
        require(block.timestamp >= allowMintingOn);
        // Must mint at least 1 token
        require(_mintAmount > 0);
        // Require enough payment
        require(msg.value >= cost * _mintAmount);
        // Require mint amount does not exceed 5 
        require(_mintAmount <= maxMintAmount, "Cannot mint more than maxMintAmount");
        // Check if whitelistOnly is enabled and if so, check if user is whitelisted
        if (whitelistOnly) {
            require(whitelist[msg.sender], "Address Not whitelisted");
        }

        uint256 supply = totalSupply();

        // Do not let them mint more tokens than available
        require(supply + _mintAmount <= maxSupply);


        // Create tokens
        for(uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }

        // Emit event
        emit Mint(_mintAmount, msg.sender);
    }

    // Whitelist management functions (owner only)
    function addToWhitelist(address _address) public onlyOwner {
        whitelist[_address] = true;
        emit AddedToWhitelist(_address);
    }
    
    function removeFromWhitelist(address _address) public onlyOwner {
        whitelist[_address] = false;
        emit RemovedFromWhitelist(_address);
    }
    
    function addManyToWhitelist(address[] calldata _addresses) public onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = true;
            emit AddedToWhitelist(_addresses[i]);
        }
    }
    
    function setWhitelistOnly(bool _whitelistOnly) public onlyOwner {
        whitelistOnly = _whitelistOnly;
        emit WhitelistOnlyChanged(_whitelistOnly);
    }
    
    // Check if an address is whitelisted
    function isWhitelisted(address _address) public view returns (bool) {
        return whitelist[_address];
    }

    // Add a function to set maxMintAmount (only owner)
    function setMaxMintAmount(uint256 _newMaxMintAmount) public onlyOwner {
        maxMintAmount = _newMaxMintAmount;
    }

    // Return metadata IPFS url
    // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns(string memory)
    {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        return
            string(
                abi.encodePacked(
                    baseURI,
                    _tokenId.toString(),
                    baseExtension
                )
            );
    }

    function walletOfOwner(address _owner) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i = 0; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    // Owner functions

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success);

        emit Withdraw(balance, msg.sender);
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

}
