// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./ArtistMint.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ArtistCollab is ArtistMint {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.UintSet;

    struct ColabRequest {
        address addr;
        uint256 tokenId;
        uint256 approvals;
        uint256 rejections;
        string tokenURI;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => ColabRequest) internal idToColabRequest;

    /*
    * Request for colab and get approved for finalization
    */
    function requestColab(uint256 _tokenId, string memory _tokenURI) public {
        require(idToColabRequest[_tokenId].addr == address(0), "Previous request pending");

        idToColabRequest[_tokenId].addr = msg.sender;
        idToColabRequest[_tokenId].tokenId = _tokenId;
        idToColabRequest[_tokenId].tokenURI = _tokenURI;
    }

    function approveColab(uint256 _tokenId, bool _decision) public {
        require(idToCollection[addressToId[msg.sender]].contains(_tokenId), "Only owners can approve");

        ColabRequest storage request = idToColabRequest[_tokenId];

        require(!request.hasVoted[msg.sender], "One vote per owner");

        if (_decision) {
            request.approvals = request.approvals.add(1);
        } else {
            request.rejections = request.rejections.add(1);
        }

        uint256 voteCount = request.approvals.add(request.rejections);

        if (voteCount == idToOwners[_tokenId].length) {
            _finalizeColab(_tokenId, request.tokenURI, request.addr, request.approvals > request.rejections);
        }
    }

    function _finalizeColab(uint256 _tokenId, string memory _tokenURI, address _address, bool _decision) private {
        delete idToColabRequest[_tokenId];

        if (_decision) {
            PaymentSplitter paymentSplitter = PaymentSplitter(payable(idToManager[_tokenId]));
            paymentSplitter.addPayee(_address, 1);
            _setTokenURI(_tokenId, _tokenURI);
            idToOwners[_tokenId].push(_address);
        }
    }
}
