import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addTransaction, getDashboardInformation, getTransactions, transferMoneyToAccount } from '../controllers/transactionController.js';


const router = express.Router();

router.get("/", authMiddleware, getTransactions);
router.post("/dodaj-transakcje/:account_id", authMiddleware, addTransaction);
router.get("/panel", authMiddleware, getDashboardInformation);
router.put("/transfer-srodkow", authMiddleware, transferMoneyToAccount);

export default router;