import Joi from "joi";


const getUserBalanceSchema = Joi.object({
  userId: Joi.number().required()
});

export default getUserBalanceSchema;
