import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICustomOrder extends Document {
  id: String,
  orderNumber: Number,
  status: String,
  sellCoin: String,
  buyCoin: String,
  buyAmount: Number,
  sellAmount: Number,
  rate: Number,
  comission: Number
}

const CustomOrderSchema: Schema<ICustomOrder> = new Schema({
  id: { type: String, required: true },
  orderNumber: { type: Number, required: true },
  status: { type: String, required: true },
  sellCoin: { type: String, required: true },
  buyCoin: { type: String, required: true },
  buyAmount: { type: Number, required: true },
  sellAmount: { type: Number, required: true },
  rate: { type: Number, required: true },
  comission: { type: Number, required: true },
});

const CustomOrder: Model<ICustomOrder> = mongoose.model<ICustomOrder>('CustomOrder', CustomOrderSchema);

export default CustomOrder;