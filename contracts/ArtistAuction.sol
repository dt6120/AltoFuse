// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./ArtistCollab.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ArtistAuction is ArtistCollab {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.UintSet;

    struct AuctionRequest {
        uint256 tokenId;
        uint256 approvals;
        uint256 rejections;
        uint256 price;
        mapping(address => bool) hasVoted;
    }

    struct HighestBid {
        uint256 tokenId;
        address bidder;
        uint256 price;
        uint256 approvals;
        uint256 rejections;
        mapping(address => bool) hasVoted;
        bool seal;
    }

    mapping(uint256 => AuctionRequest) internal idToAuctionRequest;
    mapping(uint256 => HighestBid) internal idToHighestBid;

    /*
    * Request for auction and get approved to start accepting bids
    */
    function requestAuction(uint256 _tokenId, uint256 _startingPrice) public {
        require(idToCollection[addressToId[msg.sender]].contains(_tokenId), "Only owners can approve");

        AuctionRequest storage request = idToAuctionRequest[_tokenId];

        require(request.tokenId == 0, "Previous request pending");

        request.tokenId = _tokenId;
        request.price = _startingPrice;
        request.approvals = request.approvals.add(1);
        request.hasVoted[msg.sender] = true;
    }

    function approveAuction(uint256 _tokenId, bool _decision) public {
        require(idToCollection[addressToId[msg.sender]].contains(_tokenId), "Only owners can approve");

        AuctionRequest storage request = idToAuctionRequest[_tokenId];

        require(!request.hasVoted[msg.sender], "One vote per owner");

        request.hasVoted[msg.sender] = true;

        if (_decision) {
            request.approvals = request.approvals.add(1);
        } else {
            request.rejections = request.rejections.add(1);
        }

        uint256 voteCount = request.approvals.add(request.rejections);

        if (voteCount == idToOwners[_tokenId].length) {
            _putUpForAuction(_tokenId, request.price, request.approvals > request.rejections);
        }
    }

    function _putUpForAuction(uint256 _tokenId, uint256 _startingPrice, bool _decision) private {
        delete idToAuctionRequest[_tokenId];

        if (_decision) {
            idToHighestBid[_tokenId].price = _startingPrice;
        }
    }
}