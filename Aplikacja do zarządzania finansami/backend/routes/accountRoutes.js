import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addMoneyToAccount, createAccount, getAccounts, deleteAccount } from '../controllers/accountController.js';


const router = express.Router();

router.get("/:id?", authMiddleware, getAccounts);
router.post("/nowe-konto", authMiddleware, createAccount);
router.put("/dodaj-srodki/:id", authMiddleware, addMoneyToAccount);
router.delete("/:id", authMiddleware, deleteAccount);

export default router;