const { model, Schema } = require('mongoose');


const CrossfiSendAdminSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },

  hash: {
    type: String,
    required: true,
    uniq: true
  },

  coin: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    required: true,
    enum: ['Done', 'Processed', 'Fail']
  }
})

const CrossfiSendAdmin = model('send-admin-crossfi', CrossfiSendAdminSchema)

module.exports = CrossfiSendAdmin;