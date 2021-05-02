// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./ArtistAuction.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ArtistBid is ArtistAuction {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.UintSet;

    /*
    * Bid for NFT
    */
    function raiseBid(uint256 _tokenId, uint256 _bid) public {
        require(!idToCollection[addressToId[msg.sender]].contains(_tokenId), "Owner cannot bid");

        HighestBid storage bid = idToHighestBid[_tokenId];
        
        require(!bid.seal, "Bid is sealed");
        require(_bid > bid.price, "Raise bid price");

        bid.bidder = msg.sender;
        bid.price = _bid;
        bid.approvals = 0;
        bid.rejections = 0;
    }

    function approveBid(uint256 _tokenId, bool _decision) public {
        require(idToCollection[addressToId[msg.sender]].contains(_tokenId), "Only owners can approve");

        HighestBid storage bid = idToHighestBid[_tokenId];

        require(!bid.hasVoted[msg.sender], "One vote per owner");

        if (_decision) {
            bid.approvals = bid.approvals.add(1);
        } else  {
            bid.rejections = bid.rejections.add(1);
        }

        uint256 voteCount = bid.approvals.add(bid.rejections);

        if (voteCount == idToOwners[_tokenId].length) {
            _sealBid(_tokenId);
        }
    }

    function _sealBid(uint256 _tokenId) private {
        idToHighestBid[_tokenId].seal = true;
        _approve(idToHighestBid[_tokenId].bidder, _tokenId);
    }
}