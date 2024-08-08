const mongoose = require('mongoose');

const P2PLoansOrder = mongoose.model('p2p-loans-orders', {
  buyerId: Number,
  sellerId: Number,
  statusOrder: String, //Processed, Done, Fail
  type: String,
  name: String,
  currency: String,
  price: Number,
  photo: String,
  description: String,
  requisites: String,
  collateral: Number,
  downPayment: Number
});

module.exports = P2PLoansOrder;