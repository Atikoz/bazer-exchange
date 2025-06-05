import { Schema, model } from "mongoose";

const TransactionUsdtStatusSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  coin: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    uniq: true
  },
  status: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
})

const TransactionUsdtStatus = model('TransactionUsdtStatus', TransactionUsdtStatusSchema)

export default TransactionUsdtStatus;