import Joi from "joi";


const verifyCodeSchema = Joi.object({
  email: Joi.string().required().email(),
  code: Joi.number().required()
});

export default verifyCodeSchema;  