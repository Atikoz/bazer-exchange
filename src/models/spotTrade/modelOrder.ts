import { Document, Schema, model } from "mongoose";

export interface CustomOrderDocument extends Document {
  id: number;
  orderNumber: number;
  status: 'Done' | 'Deleted' | 'Selling';
  buyCoin: string;
  sellCoin: string;
  buyAmount: number;
  sellAmount: number;
  rate: number;
  comission: number;
}

const CustomOrderSchema = new Schema({
  id: { type: String, required: true },
  orderNumber: { type: Number, required: true },
  status: { type: String, required: true },
  sellCoin: { type: String, required: true },
  buyCoin: { type: String, required: true },
  buyAmount: { type: Number, required: true },
  sellAmount: { type: Number, required: true },
  rate: { type: Number, required: true },
  comission: { type: Number, required: true }
});

const CustomOrder = model('CustomOrder', CustomOrderSchema)

export default CustomOrder;