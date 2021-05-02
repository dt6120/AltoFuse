import web3 from './getweb3';
import ArtistMarket from '../ethereum/build/ArtistMarket.json';

const address = ArtistMarket.contracts.ArtistMarket.address;

const abi = ArtistMarket.contracts.ArtistMarket.abi;

export default new web3.eth.Contract(abi, address);
