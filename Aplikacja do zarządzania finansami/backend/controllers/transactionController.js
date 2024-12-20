import { pool } from "../libs/database.js";
import { getMonthName } from "../libs/index.js";

export const getTransactions = async(req, res) => {
    try {
        
        const today = new Date();

        const _sevenDaysAgo = new Date(today);
        _sevenDaysAgo.setDate(today.getDate() - 7);

        const sevenDaysAgo = _sevenDaysAgo.toISOString().split("T")[0];

        const {df, dt, s} = req.query;

        const {userId} = req.body.user;

        const startDate = new Date(df || sevenDaysAgo);
        const endDate = new Date(dt || new Date());

        const transactions = await pool.query({
            text: `SELECT * FROM tbltransaction 
            WHERE user_id = $1 
            AND createdat BETWEEN $2 AND $3 
            AND (description ILIKE '%' || $4 || '%' 
                OR status ILIKE '%' || $4 || '%' 
                OR source ILIKE '%' || $4 || '%') 
            ORDER BY id DESC`,
            values: [userId, startDate, endDate, s]
        });

        res.status(200).json({
            status: "success",
            data: transactions.rows
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};

export const addTransaction = async(req, res) => {
    try {
        
        const {userId} = req.body.user;
        const {account_id} = req.params;
        const {description, source, amount} = req.body;

        if(!(description || source || amount)) {
            return res.status(403).json({
                status: "failed",
                message: "Wprowadź wymagane dane!"
            });
        }

        if(Number(amount) <= 0) {
            return res.status(403).json({
                status: "failed",
                message: "Wartość musi być większa niż 0"
            });
        }

        const result = await pool.query({
            text: `SELECT * FROM tblaccount WHERE id = $1`,
            values: [account_id]
        });

        const accountInfo = result.rows[0];

        if(!accountInfo) {
            return res.status(404).json({
                status: "failed",
                message: "Nie odnaleziono konta"
            });
        }

        if( accountInfo.account_balance <= 0 || accountInfo.account_balance < Number(amount)) {
            return res.status(403).json({
                status: "failed",
                message: "Niewystarczające środki"
            });
        }

        // Transakcja
        await pool.query("BEGIN");

        await pool.query({
            text: `UPDATE tblaccount SET account_balance = account_balance - $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
            values: [amount, account_id]    
        });

        await pool.query({
            text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6)`,
            values: [userId, description, "expense", "Completed", amount, source]    
        });

        res.status(200).json({
            status: "success",
            message: "Transakcja zakończona sukcesem"
        });

        await pool.query("COMMIT");

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};

export const transferMoneyToAccount = async(req, res) => {
    try {
        
        const {userId} = req.body.user;
        const {from_account, to_account, amount} = req.body;

        if(!(from_account || to_account || amount)) {
            return res.status(403).json({
                status: "failed",
                message: "Wprowadź wymagane dane!"
            });
        }

        const newAmount = Number(amount);

        if(newAmount <= 0) {
            return res.status(403).json({
                status: "failed",
                message: "Wpisz dodatnią niezerową ilość"
            });
        }

        const fromAccountResult = await pool.query({
            text: `SELECT * FROM tblaccount WHERE id = $1`,
            values: [from_account]
        });

        const fromAccount = fromAccountResult.rows[0];

        if(!fromAccount) {
            return res.status(404).json({
                status: "failed",
                message: "Nie znaleziono konta źródłowego"
            });
        }

        if (newAmount > fromAccount.account_balance) {
            return res.status(403).json({
                status: "failed",
                message: "Niewystarczające środki"
            });
        }

        // Transakcja
        await pool.query("BEGIN");

        // Odjęcie od jednego
        await pool.query({
            text: `UPDATE tblaccount SET account_balance = account_balance - $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
            values: [newAmount, from_account]    
        });

        // Dodanie do drugiego
        const toAccount = await pool.query({
            text: `UPDATE tblaccount SET account_balance = account_balance + $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            values: [newAmount, to_account]    
        });

        const description1 = `Transfer (${fromAccount.account_name} - ${toAccount.rows[0].account_name})`;

        await pool.query({
            text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6)`,
            values: [userId, description1, "expense", "Completed", amount, fromAccount.account_name]    
        });

        const description2 = `Received (${fromAccount.account_name} - ${toAccount.rows[0].account_name})`;

        await pool.query({
            text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6)`,
            values: [userId, description2, "income", "Completed", amount, toAccount.rows[0].account_name]    
        });

        await pool.query("COMMIT");

        res.status(201).json({
            status: "success",
            message: "Transakcja zakończona sukcesem"
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};

export const getDashboardInformation = async (req, res) => {
    try {
      const { userId } = req.body.user;
  
      let totalIncome = 0;
      let totalExpense = 0;
  
      // Pobieranie sum dochodów i wydatków w bieżącym miesiącu
      const transactionsResult = await pool.query({
        text: `SELECT type, SUM(amount) AS totalAmount 
               FROM tbltransaction 
               WHERE user_id = $1 AND createdat >= DATE_TRUNC('month', CURRENT_DATE)
               GROUP BY type`,
        values: [userId],
      });
  
      const transactions = transactionsResult.rows;
  
      transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          totalIncome += parseFloat(transaction.totalamount);
        } else {
          totalExpense += parseFloat(transaction.totalamount);
        }
      });
  
      // Pobieranie availableBalance z tabeli tblaccount
      const balanceResult = await pool.query({
        text: `SELECT COALESCE(SUM(account_balance), 0) AS totalBalance
               FROM tblaccount
               WHERE user_id = $1`,
        values: [userId],
      });
  
      const availableBalance = parseFloat(balanceResult.rows[0].totalbalance);
  
      // Pobieranie transakcji z podziałem na dni tygodnia
      const result = await pool.query({
        text: `SELECT EXTRACT(DOW FROM createdat) AS day, type, SUM(amount) AS totalAmount
               FROM tbltransaction 
               WHERE user_id = $1 AND createdat >= DATE_TRUNC('month', CURRENT_DATE)
               GROUP BY EXTRACT(DOW FROM createdat), type`,
        values: [userId],
      });
  
      // Funkcja zwracająca nazwę dnia tygodnia z Poniedziałkiem jako pierwszym
      const getDayName = (dayIndex) => {
        const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
        return days[dayIndex];
      };
  
      // Tworzymy tablicę dla dni tygodnia z Niedzielą na końcu
      const data = Array.from({ length: 7 }, (_, index) => {
        // Przesuwamy Niedzielę (0) na koniec
        const adjustedIndex = index === 6 ? 0 : index + 1;
  
        const dayData = result.rows.filter((item) => parseInt(item.day) === adjustedIndex);
  
        const income = dayData.find((item) => item.type === 'income')?.totalamount || 0;
        const expense = dayData.find((item) => item.type === 'expense')?.totalamount || 0;
  
        return {
          label: getDayName(index),
          income: parseFloat(income),
          expense: parseFloat(expense),
        };
      });
  
      res.status(200).json({
        status: "success",
        availableBalance,
        totalIncome,
        totalExpense,
        chartData: data,
      });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "failed", message: error.message });
    }
  };
  
  
