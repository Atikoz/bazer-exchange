const mongoose = require('mongoose');

const HashSendAdminComission = mongoose.model('Hash-SendAdmin-Comission', {
  id: String,
  hash: String,
  status: String,
  amount: Number,
  coin: String
});

module.exports = HashSendAdminComission;