const Joi = require('joi');


const registrationSchema = Joi.object({
  userId: Joi.number().required(),
  // email: Joi.string().required().email()
});

module.exports = {
  registrationSchema
};
