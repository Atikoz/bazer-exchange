import { model, Schema } from "mongoose";

const P2PLoansOrderSchema = new Schema({
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
});

const P2PLoansOrder = model('p2p-loans-orders', P2PLoansOrderSchema);

export default P2PLoansOrder;