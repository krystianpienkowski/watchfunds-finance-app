import { pool } from "../libs/database.js"
import { comparePassword, hashPassword } from "../libs/index.js";

export const getUser = async (req, res) => {
  try {
      const { userId } = req.body.user;

      const { rows } = await pool.query({
          text: `SELECT * FROM tbluser WHERE id = $1`,
          values: [userId]
      });

      const user = rows[0];

      if (!user) {
          return res.status(404).json({
              status: "failed",
              message: "Nie znaleziono użytkownika",
          });
      }

      user.password = undefined;

      res.status(200).json({
          status: "success",
          user,
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({
          status: "failed",
          message: "Wystąpił błąd podczas przetwarzania żądania",
      });
  }
};


export const changePassword = async (req, res) => {
  try {
      const { userId } = req.body.user;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || currentPassword.length < 3 || currentPassword.length > 20) {
          return res.status(400).json({
              status: "failed",
              message: "Aktualne hasło musi mieć od 3 do 20 znaków",
          });
      }

      if (!newPassword || newPassword.length < 3 || newPassword.length > 20) {
          return res.status(400).json({
              status: "failed",
              message: "Nowe hasło musi mieć od 3 do 20 znaków",
          });
      }

      if (!confirmPassword || confirmPassword.length < 3 || confirmPassword.length > 20) {
          return res.status(400).json({
              status: "failed",
              message: "Nowe hasło musi mieć od 3 do 20 znaków",
          });
      }

      const { rows } = await pool.query({
          text: `SELECT * FROM tbluser WHERE id = $1`,
          values: [userId],
      });

      const user = rows[0];

      if (!user) {
          return res.status(404).json({
              status: "failed",
              message: "Nie znaleziono użytkownika",
          });
      }

      if (newPassword !== confirmPassword) {
          return res.status(400).json({
              status: "failed",
              message: "Hasła się różnią",
          });
      }

      const isMatch = await comparePassword(currentPassword, user.password);

      if (!isMatch) {
          return res.status(401).json({
              status: "failed",
              message: "Nieprawidłowe hasło",
          });
      }

      const hashedPassword = await hashPassword(newPassword);

      await pool.query({
          text: `UPDATE tbluser SET password = $1 WHERE id = $2`,
          values: [hashedPassword, userId],
      });

      res.status(200).json({
          status: "success",
          message: "Hasło zostało zmienione",
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          status: "failed",
          message: "Wystąpił błąd podczas zmiany hasła",
      });
  }
};

export const updateUser = async (req, res) => {
  try {
      const { userId } = req.body.user;
      const { firstname, lastname, email, currency } = req.body;

      // Pobranie obecnych danych użytkownika
      const { rows: existingUserRows } = await pool.query({
          text: `SELECT * FROM tbluser WHERE id = $1`,
          values: [userId],
      });

      const user = existingUserRows[0];

      if (!user) {
          return res.status(404).json({
              status: "failed",
              message: "Nie znaleziono użytkownika",
          });
      }

      // Sprawdzenie, czy email już istnieje dla innego użytkownika
      if (email && email !== user.email) {
          const { rows: emailCheckRows } = await pool.query({
              text: `SELECT * FROM tbluser WHERE email = $1 AND id != $2`,
              values: [email, userId],
          });

          if (emailCheckRows.length > 0) {
              return res.status(409).json({
                  status: "failed",
                  message: "Podany email już istnieje w innym koncie",
              });
          }
      }

      // Przygotowanie pól do aktualizacji
      const updatedFields = {
          firstname: firstname || user.firstname,
          lastname: lastname || user.lastname,
          email: email || user.email,
          currency: currency || user.currency,
      };

      // Aktualizacja danych użytkownika
      const { rows: updatedUserRows } = await pool.query({
          text: `UPDATE tbluser SET firstname = $1, lastname = $2, email = $3, currency = $4, updatedat = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
          values: [
              updatedFields.firstname,
              updatedFields.lastname,
              updatedFields.email,
              updatedFields.currency,
              userId,
          ],
      });

      const updatedUser = updatedUserRows[0];
      updatedUser.password = undefined;

      res.status(200).json({
          status: "success",
          message: "Dane zostały zaktualizowane",
          user: updatedUser,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          status: "failed",
          message: "Wystąpił błąd podczas aktualizacji danych",
      });
  }
};

  