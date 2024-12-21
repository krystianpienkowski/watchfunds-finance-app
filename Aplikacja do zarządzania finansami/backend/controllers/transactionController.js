import { pool } from "../libs/database.js";
import { getMonthName } from "../libs/index.js";

export const getTransactions = async (req, res) => {
    try {
        const { df, dt, s } = req.query;
        const { userId } = req.body.user;

        // Obliczanie zakresu dat
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const startDate = new Date(df || sevenDaysAgo.toISOString().split("T")[0]);
        const endDate = new Date(dt || today.toISOString().split("T")[0]);
        // Dodanie jednego dnia do daty końcowej
        endDate.setDate(endDate.getDate() + 1);

        console.log("Start Date:", startDate.toISOString());
        console.log("End Date:", endDate.toISOString());

        // Pobieranie transakcji z bazy danych
        const query = {
            text: `SELECT * FROM tbltransaction 
                   WHERE user_id = $1 
                     AND createdat >= $2 
                     AND createdat < $3 
                     AND (description ILIKE '%' || $4 || '%' 
                          OR status ILIKE '%' || $4 || '%' 
                          OR source ILIKE '%' || $4 || '%') 
                   ORDER BY id DESC`,
            values: [userId, startDate.toISOString(), endDate.toISOString(), s]
        };

        const transactionsResult = await pool.query(query);

        res.status(200).json({
            status: "success",
            data: transactionsResult.rows
        });

    } catch (error) {
        console.error("Error in getTransactions:", error);
        res.status(500).json({
            status: "failed",
            message: "An error occurred while retrieving transactions"
        });
    }
};


export const addTransaction = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { account_id } = req.params;
        const { description, source, amount, type } = req.body;

        if (!(description && source && amount && type)) {
            return res.status(403).json({
                status: "failed",
                message: "Wprowadź wymagane dane!"
            });
        }

        if (type !== "income" && type !== "expense") {
            return res.status(403).json({
                status: "failed",
                message: "Nieprawidłowy typ transakcji!"
            });
        }

        if (Number(amount) <= 0) {
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

        if (!accountInfo) {
            return res.status(404).json({
                status: "failed",
                message: "Nie odnaleziono konta"
            });
        }

        if (type === "expense" && (accountInfo.account_balance <= 0 || accountInfo.account_balance < Number(amount))) {
            return res.status(403).json({
                status: "failed",
                message: "Niewystarczające środki"
            });
        }

        // Transakcja
        await pool.query("BEGIN");

        if (type === "expense") {
            await pool.query({
                text: `UPDATE tblaccount SET account_balance = account_balance - $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
                values: [amount, account_id]
            });
        } else if (type === "income") {
            await pool.query({
                text: `UPDATE tblaccount SET account_balance = account_balance + $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
                values: [amount, account_id]
            });
        }

        await pool.query({
            text: `INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6)`,
            values: [userId, description, type, "Completed", amount, source]
        });

        await pool.query("COMMIT");

        res.status(200).json({
            status: "success",
            message: "Transakcja zakończona sukcesem"
        });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.log(error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};

export const transferMoneyToAccount = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { from_account, to_account, amount } = req.body;

        if (!from_account || !to_account || !amount) {
            return res.status(400).json({
                status: "failed",
                message: "Wprowadź wymagane dane!",
            });
        }

        const newAmount = parseFloat(amount);

        if (isNaN(newAmount) || newAmount <= 0) {
            return res.status(400).json({
                status: "failed",
                message: "Wpisz dodatnią niezerową ilość",
            });
        }

        const { rows: fromAccountRows } = await pool.query({
            text: "SELECT * FROM tblaccount WHERE id = $1",
            values: [from_account],
        });

        const fromAccount = fromAccountRows[0];

        if (!fromAccount) {
            return res.status(404).json({
                status: "failed",
                message: "Nie znaleziono konta źródłowego",
            });
        }

        if (newAmount > fromAccount.account_balance) {
            return res.status(403).json({
                status: "failed",
                message: "Niewystarczające środki",
            });
        }

        // Rozpoczęcie transakcji
        await pool.query("BEGIN");

        // Aktualizacja salda konta źródłowego
        await pool.query({
            text: "UPDATE tblaccount SET account_balance = account_balance - $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2",
            values: [newAmount, from_account],
        });

        // Aktualizacja salda konta docelowego
        const { rows: toAccountRows } = await pool.query({
            text: "UPDATE tblaccount SET account_balance = account_balance + $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            values: [newAmount, to_account],
        });

        const toAccount = toAccountRows[0];

        const transactionDescription = `Transfer (${fromAccount.account_name} - ${toAccount.account_name})`;

        // Dodanie wpisu transakcji dla konta źródłowego
        await pool.query({
            text: "INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6)",
            values: [
                userId,
                transactionDescription,
                "expense",
                "Completed",
                newAmount,
                fromAccount.account_name,
            ],
        });

        // Dodanie wpisu transakcji dla konta docelowego
        await pool.query({
            text: "INSERT INTO tbltransaction(user_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6)",
            values: [
                userId,
                transactionDescription,
                "income",
                "Completed",
                newAmount,
                toAccount.account_name,
            ],
        });

        // Zatwierdzenie transakcji
        await pool.query("COMMIT");

        res.status(201).json({
            status: "success",
            message: "Transakcja zakończona sukcesem",
        });
    } catch (error) {
        console.error(error);
        await pool.query("ROLLBACK");
        res.status(500).json({
            status: "failed",
            message: "Wystąpił błąd podczas przetwarzania transakcji",
        });
    }
};

export const getDashboardInformation = async (req, res) => {
    try {
        const { userId } = req.body.user;

        let totalIncome = 0;
        let totalExpense = 0;

        // Pobieranie sum dochodów i wydatków w bieżącym miesiącu, wykluczając transfery
        const { rows: transactions } = await pool.query({
            text: `SELECT type, SUM(amount) AS totalAmount 
                   FROM tbltransaction 
                   WHERE user_id = $1 
                     AND createdat >= DATE_TRUNC('month', CURRENT_DATE)
                     AND NOT description LIKE 'Transfer%'
                   GROUP BY type`,
            values: [userId],
        });

        transactions.forEach(({ type, totalamount }) => {
            if (type === "income") {
                totalIncome += parseFloat(totalamount);
            } else {
                totalExpense += parseFloat(totalamount);
            }
        });

        // Pobieranie availableBalance z tabeli tblaccount
        const { rows: balanceRows } = await pool.query({
            text: `SELECT COALESCE(SUM(account_balance), 0) AS totalBalance
                   FROM tblaccount
                   WHERE user_id = $1`,
            values: [userId],
        });

        const availableBalance = parseFloat(balanceRows[0].totalbalance);

        // Pobieranie transakcji z podziałem na dni tygodnia, wykluczając transfery
        const { rows: dayTransactions } = await pool.query({
            text: `SELECT EXTRACT(DOW FROM createdat) AS day, type, SUM(amount) AS totalAmount
                   FROM tbltransaction 
                   WHERE user_id = $1 
                     AND createdat >= DATE_TRUNC('month', CURRENT_DATE)
                     AND NOT description LIKE 'Transfer%'
                   GROUP BY EXTRACT(DOW FROM createdat), type`,
            values: [userId],
        });

        // Funkcja zwracająca nazwę dnia tygodnia z Poniedziałkiem jako pierwszym
        const getDayName = (dayIndex) => {
            const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
            return days[dayIndex];
        };

        // Tworzymy tablicę dla dni tygodnia z Niedzielą na końcu
        const chartData = Array.from({ length: 7 }, (_, index) => {
            const adjustedIndex = index === 6 ? 0 : index + 1;

            const dayData = dayTransactions.filter(({ day }) => parseInt(day) === adjustedIndex);

            const income = dayData.find(({ type }) => type === 'income')?.totalamount || 0;
            const expense = dayData.find(({ type }) => type === 'expense')?.totalamount || 0;

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
            chartData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "failed",
            message: "Wystąpił błąd podczas pobierania informacji",
        });
    }
};
  
  
  
