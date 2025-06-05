import { model, Schema } from "mongoose";

const CustomP2POrderSchema = new Schema({
  id: { type: String, required: true },
  orderNumber: { type: Number, required: true },
  type: { type: String, required: true },
  status: { type: String, required: true },
  coin: { type: String, required: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  rate: { type: Number, required: true },
  minAmount: { type: Number, required: true },
  paymentSystem: { type: String, required: true },
  requisites: { type: Number, required: true }
});

const CustomP2POrder = model('CustomP2POrder', CustomP2POrderSchema)

export default CustomP2POrder;