const Joi = require('joi');

const getUserOrdersSchema = Joi.object({
  userId: Joi.number().required()
});

module.exports = {
  getUserOrdersSchema
};