import Joi from "joi";


const registrationSchema = Joi.object({
  userId: Joi.number().required(),
  email: Joi.string().required().email(),
  bazerId: Joi.string().required(),
  refferId: Joi.string().required()
});

export default registrationSchema;
