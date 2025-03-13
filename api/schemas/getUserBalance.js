const Joi = require('joi');


const getUserBalanceSchema = Joi.object({
  userId: Joi.number().required()
});

module.exports = {
  getUserBalanceSchema
};
