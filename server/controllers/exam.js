const Web3 = require('web3').default;
const { Network, Alchemy } = require("alchemy-sdk");
const NFTModel = require("../models/nft");
const IPFSModel = require("../models/ipfs");
const { uploadJSON } = require("../utils/handleIPFS")
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: Network.ETH_SEPOLIA,
};

const tokenABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];

const getNFT = async (req, res) => {
  const contractAddress = req.params.contractAddress;
  const tokenId = req.params.tokenId;
  const alchemy = new Alchemy(settings);
  try {
    const data = await NFTModel.findOne({ contractAddress, tokenId });
    if (data) {
      res.send(data)
      return
    }
    const { name, description, image } = await alchemy.nft.getNftMetadata(
      contractAddress,
      tokenId
    );
    const newData = {
      contractAddress,
      tokenId,
      name,
      description,
      imageUrl: image.originalUrl,
    };
    const response = await NFTModel.create(newData);
    res.send(response)
  } catch (err) {
    console.log(err);
  }
}

const getBalance = async (req, res) => {
  const contractAddress = req.params.contractAddress;
  const walletAddress = req.params.walletAddress;
  const web3 = new Web3(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
  try {
    const tokenContract = new web3.eth.Contract(tokenABI, contractAddress);
    const balance = await tokenContract.methods.balanceOf(walletAddress).call();
    const formattedBalance = balance.toString();
    res.json({ balance: formattedBalance });
  } catch (error) {
    console.log('Error retrieving token balance:', error);
    res.status(500).json({ error: 'Failed to retrieve token balance' });
  }
}

const createContent = async (req, res) => {
  const { content } = req.body;
  try {
    const ipfsHash = await uploadJSON(content);
    const response = await IPFSModel.create({content, ipfsHash});
    res.send(response);
  }catch(error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to store data on IPFS' });
  }
}

const getContent = async (req, res) => {
  const ipfsHash = req.params.ipfsHash;
  try {
    const ipfsData = await IPFSModel.findOne({ ipfsHash });
    if (!ipfsData) {
      return res.status(404).json({ error: 'Data not found' });
    }
    res.json({content: ipfsData.content})
  } catch(error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
}

module.exports = { getNFT, getBalance, createContent, getContent };