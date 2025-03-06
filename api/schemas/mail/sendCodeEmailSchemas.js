const Joi = require('joi');


const sendCodeEmailSchema = Joi.object({
  email: Joi.string().required().email()
});

module.exports = {
  sendCodeEmailSchema
};
