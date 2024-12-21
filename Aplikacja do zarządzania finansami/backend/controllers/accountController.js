import { pool } from "../libs/database.js";

export const getAccounts = async (req, res) => {
    try {
        const { userId } = req.body.user;

        // Query to fetch accounts
        const query = {
            text: `SELECT * FROM tblaccount WHERE user_id = $1 ORDER BY createdat ASC`,
            values: [userId]
        };

        const result = await pool.query(query);

        // Sending the response
        res.status(200).json({
            status: "success",
            data: result.rows
        });

    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({
            status: 'failed',
            message: error.message
        });
    }
};

export const createAccount = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { name, amount, account_number } = req.body;

        // walidacja długości opisu
        if (account_number.length > 50) {
            return res.status(400).json({ status: 'failed', message: "Numer konta nie może mieć więcej niż 50 znaków" });
        }

        // Walidacja kwoty początkowej
        if (amount > 100000) {
            return res.status(400).json({ status: 'failed', message: "Kwota początkowa nie może przekraczać 100 000" });
        }

        if (amount <= 0) {
            return res.status(400).json({ status: 'failed', message: "Kwota początkowa musi być dodatnia" });
        }

        // Sprawdzenie czy konto juz istnieje
        const accountExistQuery = {
            text: `SELECT * FROM tblaccount WHERE account_name = $1 AND user_id = $2`,
            values: [name, userId]
        };
        const accountExistResult = await pool.query(accountExistQuery);

        if (accountExistResult.rows.length > 0) {
            return res.status(409).json({ status: 'failed', message: "To konto już istnieje" });
        }

        // Założenie nowego konta
        const createAccountQuery = {
            text: `INSERT INTO tblaccount(user_id, account_name, account_number, account_balance) VALUES($1, $2, $3, $4) RETURNING *`,
            values: [userId, name, account_number, amount]
        };
        const createAccountResult = await pool.query(createAccountQuery);
        const account = createAccountResult.rows[0];

        // Aktualizacja tabeli
        const userAccounts = Array.isArray(name) ? name : [name];
        const updateUserAccountQuery = {
            text: `UPDATE tbluser SET accounts = array_cat(accounts, $1), updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            values: [userAccounts, userId]
        };
        await pool.query(updateUserAccountQuery);

        const description = `${account.account_name} (Wpłata początkowa)`;
        const initialDepositQuery = {
            text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
            values: [userId, description, "income", "Completed", amount, account.account_name]
        };
        await pool.query(initialDepositQuery);

        res.status(201).json({
            status: "success",
            message: "Konto utworzone pomyślnie",
            data: account
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};

export const addMoneyToAccount = async (req, res) => {
    try {
        const { user } = req.body;
        const userId = user?.userId;
        const accountId = req.params.id;
        const depositAmount = parseFloat(req.body.amount);

        if (isNaN(depositAmount) || depositAmount <= 0 || depositAmount >= 1000000) {
            return res.status(400).json({
                status: "failed",
                message: "Kwota musi być większa niż 0 i mniejsza niż 1 000 000"
            });
        }

        const updateAccountQuery = {
            text: `UPDATE tblaccount 
                   SET account_balance = account_balance + $1, updatedat = CURRENT_TIMESTAMP 
                   WHERE id = $2 RETURNING *`,
            values: [depositAmount, accountId]
        };

        const updateResult = await pool.query(updateAccountQuery);

        if (updateResult.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Konta nie znaleziono"
            });
        }

        const updatedAccount = updateResult.rows[0];
        const transactionDescription = `${updatedAccount.account_name} (Wpłata)`;

        const insertTransactionQuery = {
            text: `INSERT INTO tbltransaction 
                   (user_id, description, type, status, amount, source) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            values: [
                userId,
                transactionDescription,
                "income",
                "Completed",
                depositAmount,
                updatedAccount.account_name
            ]
        };

        await pool.query(insertTransactionQuery);

        res.status(200).json({
            status: "success",
            message: "Wpłata dodana",
            data: updatedAccount
        });

    } catch (error) {
        console.error("Error processing addMoneyToAccount:", error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
};



export const deleteAccount = async (req, res) => {
    try {
        const accountId = req.params.id;

        // Weryfikacja istnienia konta
        const accountCheckQuery = 'SELECT * FROM tblaccount WHERE id = $1';
        const accountResult = await pool.query(accountCheckQuery, [accountId]);

        if (accountResult.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Konta nie znaleziono",
            });
        }

        // Usunięcie konta
        const deleteAccountQuery = 'DELETE FROM tblaccount WHERE id = $1';
        await pool.query(deleteAccountQuery, [accountId]);

        res.status(200).json({
            status: "success",
            message: "Konto zostało usunięte",
        });
    } catch (error) {
        console.error("Error in deleteAccount:", error);
        res.status(500).json({
            status: "failed",
            message: "Błąd usuwania konta",
        });
    }
};