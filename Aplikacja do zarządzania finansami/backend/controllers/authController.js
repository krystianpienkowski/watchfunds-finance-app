import { pool } from "../libs/database.js";
import { comparePassword, hashPassword, createJWT } from "../libs/index.js";


// Rejestracja konta
export const signupUser = async(req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Sprawdzenie czy wymagane dane są wpisane
        if(!(firstName || lastName || email || password)) {
            return res.status(404).json({
                status: "failed",
                message: "Wprowadź wymagane dane!"
            });
        }

        // Sprawdzenie, czy użytkownik z podanym emailem istnieje w bazie
        const userExist = await pool.query({
            text: "SELECT EXISTS (SELECT * FROM tbluser WHERE email = $1)",
            values: [email]
        });

        if(userExist.rows[0].userExist) {
            return res.status(409).json({
                status: "failed",
                message: "Konto z podanym adresem email istnieje"
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await pool.query({
            text: `INSERT INTO tbluser (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING *`,
            values: [firstName, lastName, email, hashedPassword]
        });

        user.rows[0].password = undefined;

        res.status(201).json({
            status: "success",
            message: "Konto zostało utworzone",
            user: user.rows[0]
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};


// Logowanie
export const signinUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        // Sprawdzenie email 
        const result = await pool.query ({
            text: `SELECT * FROM tbluser WHERE email = $1`,
            values: [email]
        });

        const user = result.rows[0];

        if(!user) {
            return res.status(404).json({
                status: "failed",
                message: "Błędny email"
            });
        }

        // Sprawdzenie hasła
        const isMatch = await comparePassword(password, user?.password)

        if(!isMatch) {
            return res.status(404).json({
                status: "failed",
                message: "Błędne hasło"
            });
        }

        // Utworzenie tokena
        const token = createJWT(user.id)

        user.password = undefined

        res.status(200).json({
            status: "success",
            message: "Zalogowano",
            user, 
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'failed', message: error.message });
    }
};
