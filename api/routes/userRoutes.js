const express = require('express'); // Імпорт express
const UserController = require('../controllers/userController'); // Імпорт контролера реєстрації
const { validateRequest } = require('../middlewares/validationMiddleware'); // Імпорт middleware валідації
const { registrationSchema } = require('../schemas/authSchemas'); // Імпорт схеми валідації
const { sendCodeEmailSchema } = require('../schemas/mail/sendCodeEmailSchemas');
const { payWithBotSchema } = require('../schemas/payWithBotSchemas');
const { getUserBalanceSchema } = require('../schemas/getUserBalance');
const { verifyCodeSchema } = require('../schemas/mail/verifyCodeSchema');
const VerificationService = require('../controllers/emailController')

const router = express.Router(); // Створення екземпляра маршрутизатора

router.post('/register', validateRequest(registrationSchema), UserController.register);
router.post('/get-user-balance', validateRequest(getUserBalanceSchema), UserController.getBalanceUser);
router.post('/pay-with-bot', validateRequest(payWithBotSchema), UserController.payWithBot);
router.post('/send-mail-code', validateRequest(sendCodeEmailSchema), VerificationService.sendVerificationCode);
router.post('/verify-code', validateRequest(verifyCodeSchema), VerificationService.verifyCode);


module.exports = router;
