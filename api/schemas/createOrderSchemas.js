const Joi = require('joi');


const createOrderSchema = Joi.object({
  buyerId: Joi.number().required(),
  sellerId: Joi.number().required(),
  type: Joi.string().required(),
  name: Joi.string().required(),
  currency: Joi.string().required(),
  price: Joi.number().required(),
  photo: Joi.string().required().uri(),
  description: Joi.string().required(),
  requisites: Joi.string().required(),
  collateral : Joi.number().required(),
  downPayment: Joi.number().required(),
});

module.exports = {
  createOrderSchema
};
