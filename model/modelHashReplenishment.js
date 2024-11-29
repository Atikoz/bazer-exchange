const mongoose = require('mongoose');

const HashReplenishment = mongoose.model('HashReplenishment', {
  id: {
    type: String,
    required: true
  },
  coin: {
    type: String,
    required: true
  },
});

module.exports = HashReplenishment;