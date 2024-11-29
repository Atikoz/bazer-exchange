const mongoose = require('mongoose');


const P2PLoansOrder = mongoose.model('p2p-loans-orders', {
  buyerId: { type: Number, required: true },
  sellerId: { type: Number, required: true },
  statusOrder: {
    type: String,
    required: true,
    enum: ['WaitPayment', 'PaidBuyer', 'Canceled', 'Dispute', 'Done', 'Fail']
  },
  type: { type: String, required: true },
  name: { type: String, required: true },
  currency: { type: String, required: true },
  price: { type: Number, required: true },
  photo: { type: String, required: true },
  description: { type: String, required: true },
  requisites: { type: String, required: true },
  collateral: { type: Number, required: true },
  downPayment: { type: Number, required: true },
  socketId: { type: String, required: true },
}, { timestamps: true });

module.exports = P2PLoansOrder;