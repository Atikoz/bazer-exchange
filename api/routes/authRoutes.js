const express = require('express'); // Імпорт express
const { register } = require('../controllers/authController'); // Імпорт контролера реєстрації
const { validateRequest } = require('../middlewares/validationMiddleware'); // Імпорт middleware валідації
const { registrationSchema } = require('../schemas/authSchemas'); // Імпорт схеми валідації
const { sendVerificationCode } = require('../controllers/emailController');
const { sendCodeEmailSchema } = require('../schemas/sendCodeEmailSchemas');

const router = express.Router(); // Створення екземпляра маршрутизатора

router.post('/register', validateRequest(registrationSchema), register);
router.post('/send-mail-code', validateRequest(sendCodeEmailSchema), sendVerificationCode);


module.exports = router;
