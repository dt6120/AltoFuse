// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./ArtistFactory.sol";

contract ArtistHelper is ArtistFactory {
    using Counters for Counters.Counter;

    function changeInfo(uint256 _artistId, string memory _info) public {
        require(isArtist[msg.sender], "You are not an artist");

        Artist storage artist = idToArtist[_artistId];

        require(msg.sender == artist.addr, "You can only change your own details");

        artist.info = _info;
    }

    function getArtistCount() public view returns (uint256) {
        return artistCount.current();
    }

    function getArtistInfo(uint256 _artistId) public view returns (address, string memory, bytes32[] memory) {
        return (
            idToArtist[_artistId].addr,
            idToArtist[_artistId].info,
            idToCollection[_artistId]._inner._values
        );
    }

    // function getNftOwners(uint256 _tokenId) public view returns (address[] memory) {
    //     return idToOwners[_tokenId];
    // }

    // function getNftInfo(uint256 _tokenId) public view returns (string memory) {
    //     return tokenURI(_tokenId);
    // }
}
