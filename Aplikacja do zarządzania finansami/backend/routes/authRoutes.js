import express from 'express';
import { signinUser, signupUser } from '../controllers/authController.js';

const router = express.Router();

router.post("/logowanie", signinUser);
router.post("/rejestracja", signupUser);

export default router;