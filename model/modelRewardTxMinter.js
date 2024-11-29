const mongoose = require('mongoose');

const RewardMinter = mongoose.model('reward-minter', {
  hash: {
    type: String,
    required: true
  },
  amountReward: {
    type: Number,
    required: true
  },
});

module.exports = RewardMinter;