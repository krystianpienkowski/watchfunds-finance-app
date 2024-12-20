import { pool } from "../libs/database.js"
import { comparePassword, hashPassword } from "../libs/index.js";

export const getUser = async (req, res) => {
    try {
        const {userId} = req.body.user;

        const userExist = await pool.query({
            text: `SELECT * FROM tbluser WHERE id = $1`,
            values: [userId]
        });

        const user = userExist.rows[0]

        if(!user) {
            return res.status(404).json({
                status: "failed",
                message: "Nie znaleziono użytkownika"
            });
        }

        user.password = undefined;

        res.status(201).json({
            status: "success",
            user,
        });


    } catch (error) {
        console.log(error);
        res.status(500).json( { status: "failed", message: error.message } );
    }
};

export const changePassword = async (req, res) => {
    try {
        const {userId} = req.body.user;
        const {currentPassword, newPassword, confirmPassword} = req.body;

        const userExist = await pool.query({
            text: `SELECT * FROM tbluser WHERE id = $1`,
            values: [userId]
        });

        const user = userExist.rows[0]

        if(!user) {
            return res.status(404).json({
                status: "failed",
                message: "Nie znaleziono użytkownika"
            });
        }

        if(newPassword !== confirmPassword) {
            return res.status(401).json({
                status: "failed",
                message: "Hasła się różnią"
            });
        }

        const isMatch = await comparePassword(currentPassword, user?.password);
        
        if(!isMatch) {
            return res.status(401).json({ status: "failed", message: "Nieprawidłowe hasło" });
        }

        const hashedPassword = await hashPassword(newPassword)

        await pool.query({
            text: `UPDATE tbluser SET password = $1 WHERE id = $2`,
            values: [hashedPassword, userId]
        });

        res.status(200).json({
            status: "success",
            message: "Hasło zostało zmienione"
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json( { status: "failed", message: error.message } );
    }
};

export const updateUser = async (req, res) => {
    try {
      const { userId } = req.body.user;
      const { firstname, lastname, email, currency } = req.body;
  
      // Pobranie obecnych danych użytkownika
      const userExist = await pool.query({
        text: `SELECT * FROM tbluser WHERE id = $1`,
        values: [userId],
      });
  
      const user = userExist.rows[0];
  
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "Nie znaleziono użytkownika",
        });
      }
  
      // Sprawdzenie, czy email już istnieje dla innego użytkownika
      if (email && email !== user.email) {
        const emailCheckResult = await pool.query({
          text: `SELECT * FROM tbluser WHERE email = $1 AND id != $2`,
          values: [email, userId],
        });
  
        if (emailCheckResult.rows.length > 0) {
          return res.status(409).json({
            status: "failed",
            message: "Podany email już istnieje w innym koncie",
          });
        }
      }
  
      // Tworzenie obiektu z aktualizowanymi danymi, ignorując puste wartości
      const updatedFields = {
        firstname: firstname || user.firstname,
        lastname: lastname || user.lastname,
        email: email || user.email,
        currency: currency || user.currency,
      };
  
      // Aktualizacja danych użytkownika
      const updatedUser = await pool.query({
        text: `UPDATE tbluser SET firstname = $1, lastname = $2, email = $3, currency = $4, updatedat = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
        values: [
          updatedFields.firstname,
          updatedFields.lastname,
          updatedFields.email,
          updatedFields.currency,
          userId,
        ],
      });
  
      updatedUser.rows[0].password = undefined;
  
      res.status(200).json({
        status: "success",
        message: "Dane zostały zaktualizowane",
        user: updatedUser.rows[0],
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "failed", message: error.message });
    }
  };
  
  