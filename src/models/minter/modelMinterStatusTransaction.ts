import { model, Schema } from "mongoose";

const TransactionMinterStatusSchema = new Schema({
  id: {
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
  },
  coin: {
    type: String,
    required: true
  }
})

const TransactionMinterStatus = model('Transaction-Minter-Status', TransactionMinterStatusSchema);

export default TransactionMinterStatus;