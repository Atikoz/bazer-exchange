const Joi = require('joi');


const getUserBalanceSchema = Joi.object({
  userId: Joi.number().required(),
  mnemonic: Joi.string().required()
});

module.exports = {
  getUserBalanceSchema
};
