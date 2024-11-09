const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ipfsSchema = new mongoose.Schema({
  content: {
    type: Schema.Types.Mixed
  },
  ipfsHash: String,
});

module.exports = mongoose.model("IPFS", ipfsSchema);