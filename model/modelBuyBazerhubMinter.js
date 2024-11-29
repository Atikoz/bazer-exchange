const mongoose = require('mongoose');

const BuyBazerhubMinter = mongoose.model('buy-bazerhub-minter', {
  id: {
    type: Number,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
});

module.exports = BuyBazerhubMinter;