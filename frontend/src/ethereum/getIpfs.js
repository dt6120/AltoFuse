const IpfsHttpClient = require('ipfs-api');
const ipfs = IpfsHttpClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

export default ipfs;
