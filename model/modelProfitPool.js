const mongoose = require('mongoose');

const ProfitPoolModel = mongoose.model('Profit-pool-model', {
  id: String,
  profit: Number
});

module.exports = ProfitPoolModel;