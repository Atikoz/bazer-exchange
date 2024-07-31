const express = require('express'); // Імпорт express
const { register } = require('../controllers/authController'); // Імпорт контролера реєстрації
const { validateRequest } = require('../middlewares/validationMiddleware'); // Імпорт middleware валідації
const { registrationSchema } = require('../schemas/authSchemas'); // Імпорт схеми валідації

const router = express.Router(); // Створення екземпляра маршрутизатора

router.post('/register', validateRequest(registrationSchema), register);

module.exports = router;
