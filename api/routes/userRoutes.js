const express = require('express'); // Імпорт express
const { register, payWithBot, getBalanceUser } = require('../controllers/userController'); // Імпорт контролера реєстрації
const { validateRequest } = require('../middlewares/validationMiddleware'); // Імпорт middleware валідації
const { registrationSchema } = require('../schemas/authSchemas'); // Імпорт схеми валідації
const { sendVerificationCode } = require('../controllers/emailController');
const { sendCodeEmailSchema } = require('../schemas/sendCodeEmailSchemas');
const { payWithBotSchema } = require('../schemas/payWithBotSchemas');
const { getUserBalanceSchema } = require('../schemas/getUserBalance');

const router = express.Router(); // Створення екземпляра маршрутизатора

router.post('/register', validateRequest(registrationSchema), register);
router.post('/get-user-balance', validateRequest(getUserBalanceSchema), getBalanceUser);
router.post('/pay-with-bot', validateRequest(payWithBotSchema), payWithBot);
router.post('/send-mail-code', validateRequest(sendCodeEmailSchema), sendVerificationCode);


module.exports = router;
