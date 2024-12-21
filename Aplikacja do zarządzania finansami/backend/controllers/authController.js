import { pool } from "../libs/database.js";
import { comparePassword, hashPassword, createJWT } from "../libs/index.js";


export const signupUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Sprawdzanie, czy wszystkie wymagane pola zostały uzupełnione
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                status: "failed",
                message: "All required fields must be filled!"
            });
        }

        // Walidacja długości pól
        const isValidLength = (value) => value.length >= 3 && value.length <= 20;

        if (!isValidLength(firstName) || !isValidLength(lastName) || !isValidLength(email) || !isValidLength(password)) {
            return res.status(400).json({
                status: "failed",
                message: "Wszystkie pola muszę mieć od 3 do 20 znaków"
            });
        }

        // Weryfikacja, czy użytkownik z podanym adresem email już istnieje
        const userExistsQuery = {
            text: "SELECT EXISTS (SELECT 1 FROM tbluser WHERE email = $1)",
            values: [email]
        };

        const userExistResult = await pool.query(userExistsQuery);

        if (userExistResult.rows[0].exists) {
            return res.status(409).json({
                status: "failed",
                message: "Konto z podanym mail już istnieje"
            });
        }

        const hashedPassword = await hashPassword(password);

        const insertUserQuery = {
            text: `INSERT INTO tbluser (firstname, lastname, email, password) 
                   VALUES ($1, $2, $3, $4) RETURNING *`,
            values: [firstName, lastName, email, hashedPassword]
        };

        const newUserResult = await pool.query(insertUserQuery);
        const newUser = newUserResult.rows[0];
        newUser.password = undefined;

        res.status(201).json({
            status: "success",
            message: "Konto zostało założone",
            user: newUser
        });

    } catch (error) {
        console.error("Error in signupUser:", error);
        res.status(500).json({
            status: 'failed',
            message: "Wystąpił błąd w tworzeniu konta"
        });
    }
};



export const signinUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Pobranie użytkownika z bazy danych
        const query = {
            text: `SELECT * FROM tbluser WHERE email = $1`,
            values: [email]
        };

        const result = await pool.query(query);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "Błędny email"
            });
        }

        // Weryfikacja hasła
        const passwordValid = await comparePassword(password, user.password);

        if (!passwordValid) {
            return res.status(401).json({
                status: "failed",
                message: "Błędne hasło"
            });
        }

        // Generowanie tokena JWT
        const token = createJWT(user.id);
        user.password = undefined;

        res.status(200).json({
            status: "success",
            message: "Zalogowano",
            user,
            token
        });

    } catch (error) {
        console.error("Error during signinUser:", error);
        res.status(500).json({
            status: "failed",
            message: "Wystapił błąd w logowaniu"
        });
    }
};

