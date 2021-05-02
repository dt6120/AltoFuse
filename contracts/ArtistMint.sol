// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./ArtistHelper.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./PaymentSplitter.sol";

contract ArtistMint is ArtistHelper, ERC721URIStorage {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;

    Counters.Counter private _counter;

    mapping(string => bool) internal exists;
    mapping(uint256 => address[]) internal idToOwners;
    mapping(uint256 => address) internal idToManager;

    constructor() ERC721("AltoFuse", "ALF") {}

    /*
    * Mint NFT and create ownership manager account
    */
    function mint(string memory _hash, string memory _tokenURI) public returns (uint256) {
        require(!exists[_hash], "File already exists");

        _counter.increment();
        uint256 tokenId = _counter.current();

        idToOwners[tokenId].push(msg.sender);
        idToCollection[addressToId[msg.sender]].add(tokenId);

        idToManager[tokenId] = _createSplitter(tokenId);

        _safeMint(idToManager[tokenId], tokenId);
        _setTokenURI(tokenId, _tokenURI);

        return tokenId;
    }

    function _createSplitter(uint256 _tokenId) private returns (address) {
        address[] memory owners = idToOwners[_tokenId];
        uint256[] memory shares;
        for (uint256 i = 0; i < owners.length; i++) {
            shares[i] = 1;
        }

        return address(new PaymentSplitter(owners, shares));
    }
}