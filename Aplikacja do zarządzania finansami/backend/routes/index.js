import express from 'express';
import authRoutes from './authRoutes.js';
import accountRoutes from './accountRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();


router.use("/autoryzacja", authRoutes);
router.use("/uzytkownik", userRoutes);
router.use("/konta", accountRoutes);
router.use("/transakcje", transactionRoutes);


export default router;