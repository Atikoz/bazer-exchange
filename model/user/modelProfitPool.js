const { numberDependencies } = require('mathjs');
const mongoose = require('mongoose');

const ProfitPoolModel = mongoose.model('Profit-pool-model', {
  id: {
    type: Number,
    required: true,
    unique: true
  },
  profit: {
    type: Number,
    default: 0
  }
});

module.exports = ProfitPoolModel;