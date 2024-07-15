const mongoose = require('mongoose');

const BuyBazerhubMinter = mongoose.model('buy-bazerhub-minter', {
  id: Number,
  hash: String,
});

module.exports = BuyBazerhubMinter;