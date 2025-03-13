const Joi = require('joi');


const payWithBotSchema = Joi.object({
  userId: Joi.number().required(),
  amount: Joi.number().required(),
  coin: Joi.string().required(),
  p2pKey: Joi.string().required()
});

module.exports = {
  payWithBotSchema
};
