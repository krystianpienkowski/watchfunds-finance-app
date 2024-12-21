import { pool } from "../libs/database.js";

export const getAccounts = async(req, res) => {
    try {

        // B getAccounts
        const {userId} = req.body.user;

        const accounts = await pool.query({
            text: `SELECT * FROM tblaccount WHERE user_id = $1 ORDER BY createdat ASC`,
            values: [userId]
        });

        res.status(200).json({
            status: "success",
            data: accounts.rows
        });
        // E getAccounts
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};

export const createAccount = async(req, res) => {
    try {
        // B createAccount
        const {userId} = req.body.user;
        const {name, amount, account_number} = req.body;

        const accountExistResult = await pool.query({
            text: `SELECT * FROM tblaccount WHERE account_name = $1 AND user_id = $2`,
            values: [name, userId]
        });

        const accountExist = accountExistResult.rows[0];

        if (accountExist) {
            return res.status(409).json({ status: 'failed', message: "To konto już istnieje" });
        }

        const createAccountResult =  await pool.query({
            text: `INSERT INTO tblaccount(user_id, account_name, account_number, account_balance) VALUES($1, $2, $3, $4) RETURNING *`,
            values: [userId, name, account_number, amount]
        });

        const account = createAccountResult.rows[0];

        const userAccounts = Array.isArray(name) ? name : [name];

        const updateUserAccountQuery = {
            text: `UPDATE tbluser SET accounts = array_cat(accounts, $1), updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            values: [userAccounts, userId]
        };
        await pool.query(updateUserAccountQuery);

        const description = account.account_name + " (Wpłata początkowa)";


        const initialDepositQuery = {
            text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
            values: [userId, description, "income", "Completed", amount, account.account_name]
        }
        await pool.query(initialDepositQuery);

        res.status(201).json({
            status: "success",
            message: "Konto utworzone pomyślnie",
            data: account
        });
        // E createAccount
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};

export const addMoneyToAccount = async(req, res) => {
    try {
        const {userId} = req.body.user;
        const {id} = req.params;
        const {amount} = req.body;

        const newAmount = Number(amount);
        
        const result = await pool.query({
            text: `UPDATE tblaccount SET account_balance =(account_balance + $1), updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            values: [newAmount, id]
        });

        const accountInformation = result.rows[0];
        const description = accountInformation.account_name + " (Wpłata)";

        const transQuery = {
            text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
            values: [userId, description, "income", "Completed", amount, accountInformation.account_name]
        };
        await pool.query(transQuery);

        res.status(200).json({
            status: "success",
            message: "Operacja zakończona pomyślnie",
            data: accountInformation
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Sprawdzenie, czy konto istnieje
      const accountResult = await pool.query('SELECT * FROM tblaccount WHERE id = $1', [id]);
  
      if (accountResult.rows.length === 0) {
        return res.status(404).json({
          status: "failed",
          message: "Nie znaleziono konta",
        });
      }
  
      // Usunięcie konta
      await pool.query('DELETE FROM tblaccount WHERE id = $1', [id]);
  
      res.status(200).json({
        status: "success",
        message: "Konto zostało pomyślnie usunięte",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Wystąpił błąd podczas usuwania konta",
      });
    }
  };