const mongoose = require('mongoose');

const RewardMinter = mongoose.model('reward-minter', {
  hash: String,
  amountReward: Number,
});

module.exports = RewardMinter;