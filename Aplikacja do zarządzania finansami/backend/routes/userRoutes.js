import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { changePassword, getUser, updateUser, } from '../controllers/userController.js';


const router = express.Router();

router.get("/", authMiddleware, getUser);
router.put("/zmiana-hasla", authMiddleware, changePassword);
router.put("/", authMiddleware, updateUser);


export default router;