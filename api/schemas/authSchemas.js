const Joi = require('joi'); // Імпорт Joi

// Схема валідації для реєстрації
const registrationSchema = Joi.object({
  userId: Joi.number().required()
});

module.exports = {
  registrationSchema
};
