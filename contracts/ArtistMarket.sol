// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./ArtistHelper.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./PaymentSplitter.sol";

contract ArtistMarket is ArtistHelper, ERC721URIStorage {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;

    Counters.Counter private _counter;

    struct ColabRequest {
        address addr;
        uint256 tokenId;
        uint256 approvals;
        uint256 rejections;
        string tokenURI;
        mapping(address => bool) hasVoted;
    }

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
    mapping(uint256 => uint256) internal idToViewPrice;
    mapping(uint256 => uint256) internal idToBuyPrice;
    mapping(uint256 => bool) internal isForSale;
    mapping(string => bool) internal exists;
    mapping(uint256 => address[]) internal idToOwners;
    mapping(uint256 => address) public idToManager;
    mapping(uint256 => ColabRequest) internal idToColabRequest;
    mapping(uint256 => AuctionRequest) internal idToAuctionRequest;
    mapping(uint256 => HighestBid) internal idToHighestBid;
    mapping(address => mapping(uint256 => bool)) internal canView;
    address[] initowners;
    uint256[] initshares;

    constructor() ERC721("AltoFuse", "ALF")  {}

    /*
    * Mint NFT and create ownership manager account
    */
    //change 2
    function mint(string memory _hash, string memory _tokenURI, uint256 vp, uint256 bp) public returns (uint256) {
        require(!exists[_hash], "File already exists");
        // require(isArtist[msg.sender], "Not an artist");
        _counter.increment();
        uint256 tokenId = _counter.current();

        idToOwners[tokenId].push(msg.sender);
        idToCollection[addressToId[msg.sender]].add(tokenId);

        initowners.push(msg.sender);
        initshares.push(1);

        idToManager[tokenId] = payable(createSplitter());
        //change 3
        delete initshares;
        delete initowners;
        idToViewPrice[tokenId] = vp;
        idToBuyPrice[tokenId] = bp;

        _mint(idToManager[tokenId], tokenId);
        _setTokenURI(tokenId, _tokenURI);

        return tokenId;
    }

    function createSplitter() public returns (address newContract) {
        PaymentSplitter add =new PaymentSplitter(initowners, initshares);
        return payable(add);
    }

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

        _finalizeColab(_tokenId, request.tokenURI, request.addr, _decision);

        // require(!request.hasVoted[msg.sender], "One vote per owner");

        // if (_decision) {
        //     request.approvals = request.approvals.add(1);
        // } else {
        //     request.rejections = request.rejections.add(1);
        // }

        // uint256 voteCount = request.approvals.add(request.rejections);

        // if (voteCount == idToOwners[_tokenId].length) {
        //     _finalizeColab(_tokenId, request.tokenURI, request.addr, request.approvals > request.rejections);
        // }
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

    function viewColab(uint256 _id) public view returns (string memory){
        return idToColabRequest[_id].tokenURI;
    }

    function checkColab(uint256 _id) public view returns (bool){
        return (idToColabRequest[_id].addr==msg.sender);
    }

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

        if (idToOwners[_tokenId].length == 1) {
            _putUpForAuction(_tokenId, _startingPrice, true);
        }
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

    /*
    * Put on sale
    */
    function putOnSale(uint256 _tokenId) public {
        require(!isForSale[_tokenId], "Already on sale");
        isForSale[_tokenId] = true;
    }

    function removeFromSale(uint256 _tokenId) public {
        require(isForSale[_tokenId], "Not on sale");
        isForSale[_tokenId] = false;
    }

    function isOnSale(uint256 _tokenId) public view returns (bool) {
        return isForSale[_tokenId];
    }

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

    /*
    * Owners approve latest bid and ownership transfers to bidder post payment distribution
    */
    function buy(uint256 _tokenId) public payable {
        // require(idToHighestBid[_tokenId].seal, "Not approved to buy");
        // require(msg.value == idToHighestBid[_tokenId].price, "Price should match bid");
        //change 1
        require(msg.value == idToBuyPrice[_tokenId], "Price should match bid");
        // Address.sendValue(payable(idToManager[_tokenId]), msg.value);
        // _settleAll(_tokenId);

        for (uint256 i = 0; i < idToOwners[_tokenId].length; i++) {
            Address.sendValue(payable(idToOwners[_tokenId][i]), msg.value/idToOwners[_tokenId].length);
        }


        // safeTransferFrom(idToManager[_tokenId], msg.sender, _tokenId);

        for (uint256 i = 0; i < idToOwners[_tokenId].length; i++) {
            canView[idToOwners[_tokenId][i]][i] = true;
        }

        isForSale[_tokenId] = false;

        // delete idToManager[_tokenId];
        delete idToOwners[_tokenId];
        delete idToHighestBid[_tokenId];

        idToOwners[_tokenId].push(msg.sender);
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

    function buyview(uint256 _id) public payable{
        require(msg.value == idToViewPrice[_id], "The Buy value is not correct");
        canView[msg.sender][_id] = true;
        Address.sendValue(payable(idToManager[_id]),msg.value);
        _settleAll(_id);
    }

    function viewNow(uint256 _id) public view returns(bool){
      return canView[msg.sender][_id];
    }

    function getViewPriceFinney(uint256 _id) public view returns(uint256){
        uint256 viewValue = idToViewPrice[_id];
        return viewValue;
    }

    function getNftInfo(uint256 _id) public view returns(string memory,address[] memory,uint256, uint256){
        return (
            tokenURI(_id),
            idToOwners[_id],
            idToViewPrice[_id],
            idToBuyPrice[_id]
        );
    }
    function nfts() public view returns(uint256){
        return _counter.current();
    }
}
