// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ArtistFactory {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;

    struct Artist {
        uint256 id;
        address payable addr;
        string info;
    }

    mapping(address => bool) internal isArtist;
    mapping(address => uint256) internal addressToId;
    mapping(uint256 => Artist) internal idToArtist;
    mapping(uint256 => EnumerableSet.UintSet) internal idToCollection;

    Counters.Counter internal artistCount;

    constructor() {}

    function addNewArtist(string memory _info) public {
        require(!isArtist[msg.sender], "You are already an artist");

        isArtist[msg.sender] = true;
        artistCount.increment();
        uint256 artistId = artistCount.current();
        idToArtist[artistId] = Artist(artistId, payable(msg.sender), _info);
    }

    // function changeArtistInfo(uint256 _artistId, string memory _info) public {
    //     require(isArtist[msg.sender], "You are not an artist");

    //     Artist storage artist = idToArtist[_artistId];

    //     require(msg.sender == artist.addr, "You can only change your own details");

    //     artist.info = _info;
    //     // idToArtist[_artistId] = Artist(_artistId, payable(msg.sender), _info);
    // }

    // function getArtistCount() public view returns (uint256) {
    //     return artistCount.current();
    // }

    // function getArtistInfo(uint256 _artistId) public view returns (address, string memory, bytes32[] memory) {
    //     return (
    //         idToArtist[_artistId].addr,
    //         idToArtist[_artistId].info,
    //         idToCollection[_artistId]._inner._values
    //     );
    // }
}
