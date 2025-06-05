import Joi from "joi";


const registrationSchema = Joi.object({
  userId: Joi.number().required(),
  email: Joi.string().required().email()
});

export default registrationSchema;
