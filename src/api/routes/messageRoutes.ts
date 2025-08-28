import { Router } from "express";
import validateRequest from "../middlewares/validationMiddleware";
import sendMessageSchema from "../schemas/sendMessageSchemas";
import { MessageController } from "../controllers/messageController";

const router = Router();

router.post('/send', validateRequest(sendMessageSchema), MessageController.sendMessage);



export default router;
