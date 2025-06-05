import { model, Schema } from "mongoose";

const BuyBazerhubMinterSchema = new Schema({
  id: {
    type: Number,
    required: true
  },
  hash: {
    type: String,
    required: true,
    uniq: true
  }
});

const BuyBazerhubMinter = model('buy-bazerhub-minter', BuyBazerhubMinterSchema);

export default BuyBazerhubMinter;