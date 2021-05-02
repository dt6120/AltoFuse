// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./ArtistBid.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ArtistBuy is ArtistBid {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.UintSet;

    /*
    * Owners approve latest bid and ownership transfers to bidder post payment distribution
    */
    function buy(uint256 _tokenId) public payable {
        require(idToHighestBid[_tokenId].seal, "Not approved to buy");
        require(msg.value == idToHighestBid[_tokenId].price, "Price should match bid");

        _settleAll(_tokenId);        

        safeTransferFrom(idToManager[_tokenId], msg.sender, _tokenId);

        delete idToManager[_tokenId];
        delete idToOwners[_tokenId];
        delete idToHighestBid[_tokenId];
    }

    function _settleAll(uint256 _tokenId) private {
        address[] memory owners = idToOwners[_tokenId];

        for (uint256 i = 0; i < owners.length; i++) {
            _settle(owners[i], _tokenId);
        }
    }

    function _settle(address _address, uint256 _tokenId) private {
        PaymentSplitter paymentSplitter = PaymentSplitter(payable(idToManager[_tokenId]));
        paymentSplitter.release(payable(_address));

        idToCollection[addressToId[_address]].remove(_tokenId);
    }
}