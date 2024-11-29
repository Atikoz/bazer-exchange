const mongoose = require('mongoose');

const ProfitPoolModel = mongoose.model('Profit-pool-model', {
  id: {
    type: String,
    required: true
  },
  profit: {
    type: Number,
    default: 0
  }
});

module.exports = ProfitPoolModel;