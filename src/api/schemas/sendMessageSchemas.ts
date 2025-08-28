import Joi from "joi";


const sendMessageSchema = Joi.object({
  target: Joi.string().valid("users", "admins").required(),
  text: Joi.string().required(),
});

export default sendMessageSchema;
