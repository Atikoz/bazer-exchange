const Joi = require('joi');


const verifyCodeSchema = Joi.object({
  email: Joi.string().required().email(),
  code: Joi.number().required()
});

module.exports = {
  verifyCodeSchema
};