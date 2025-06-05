import Joi from "joi";


const sendCodeEmailSchema = Joi.object({
  email: Joi.string().required().email()
});

export default sendCodeEmailSchema;
