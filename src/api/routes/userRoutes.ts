import { Router } from "express";
import validateRequest from "../middlewares/validationMiddleware";
import registrationSchema from "../schemas/authSchemas";
import getUserBalanceSchema from "../schemas/getUserBalance";
import payWithBotSchema from "../schemas/payWithBotSchemas";
import sendCodeEmailSchema from "../schemas/mail/sendCodeEmailSchemas";
import verifyCodeSchema from "../schemas/mail/verifyCodeSchema";
import UserController from "../controllers/userController";
import VerificationService from "../controllers/emailController";
import mockAuthMiddleware from "../middlewares/authMiddleware";
const VerificationServiceInstance = new VerificationService();


const router = Router();

router.post('/register', mockAuthMiddleware, validateRequest(registrationSchema), UserController.register);
router.get('/get-user-balance/:userId', mockAuthMiddleware, UserController.getBalanceUser);
// router.post('/pay-with-bot', validateRequest(payWithBotSchema), UserController.payWithBot);
router.post('/send-mail-code', mockAuthMiddleware, validateRequest(sendCodeEmailSchema), (req, res) => VerificationServiceInstance.sendVerificationCode(req, res));
router.post('/verify-code', mockAuthMiddleware, validateRequest(verifyCodeSchema), (req, res) => VerificationServiceInstance.verifyCode(req, res));


export default router;
