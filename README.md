# WatchFunds - README

## Projekt

**WatchFunds** to fullstackowa aplikacja do zarządzania finansami osobistymi,
która pozwala użytkownikom śledzić wydatki, zarządzać wieloma kontami
oraz analizować swoje finanse za pomocą wykresów i statystyk.

Projekt został zaprojektowany jako skalowalna aplikacja webowa
z wykorzystaniem architektury REST API.

---

## Funkcjonalności

1. **Rejestracja i logowanie:**
   - Rejestracja nowych użytkowników.
   - Logowanie za pomocą email i hasła.
2. **Konta:**
   - Dodawanie nowych kont (np. Bank, Revolut, PayPal, Gotówka).
   - Przeglądanie i usuwanie kont.
   - Doładowanie kont i transfer środków między kontami.
3. **Transakcje:**
   - Dodawanie transakcji (przychody, wydatki).
   - Eksportowanie transakcji do plików Excel.
   - Filtrowanie i wyszukiwanie transakcji według zakresu dat oraz opisu.
4. **Panel użytkownika:**
   - Wyświetlanie statystyk przychodów, wydatków i salda w formie wykresów.
5. **Ustawienia:**
   - Edycja danych użytkownika.
   - Zmiana hasła.

---

## Technologie

### Backend

- **Node.js**: Platforma serwerowa.
- **Express.js**: Framework do tworzenia API RESTful.
- **PostgreSQL**: Relacyjna baza danych.
- **Sequelize**: ORM do zarządzania bazą danych.
- **JWT (JSON Web Token)**: Do uwierzytelniania i autoryzacji.
- **dotenv**: Do zarządzania zmiennymi środowiskowymi.
- **axios**: Klient HTTP używany w testowaniu endpointów i komunikacji z frontendem.

### Frontend

- **React.js**: Framework do tworzenia interfejsów użytkownika.
- **Zustand**: Biblioteka do zarządzania stanem aplikacji.
- **React Hook Form**: Do obsługi formularzy.
- **React Router**: Do nawigacji między stronami.
- **Tailwind CSS**: Stylowanie aplikacji.
- **Recharts**: Tworzenie dynamicznych wykresów.
- **sonner**: Obsługa notyfikacji.
- **react-icons**: Zbiór ikon.

---

## Struktura projektu

### Backend

```
/backend
├── controllers
│   ├── accountController.js
│   ├── authController.js
│   ├── transactionController.js
│   ├── userController.js
├── libs
│   ├── database.js
│   ├── index.js
├── middleware
│   ├── authMiddleware.js
├── routes
│   ├── accountRoutes.js
│   ├── authRoutes.js
│   ├── index.js
│   ├── transactionRoutes.js
│   ├── userRoutes.js
├── index.js
├── package.json
├── package-lock.json
```

### Frontend

```
/frontend
├── src
│   ├── assets
│   │   ├── avatar.png
│   │   ├── index.js
│   ├── components
│   │   ├── addAccount.jsx
│   │   ├── addMoney.jsx
│   │   ├── AddTransactions.jsx
│   │   ├── changePassword.jsx
│   │   ├── chart.jsx
│   │   ├── dateRange.jsx
│   │   ├── navbar.jsx
│   │   ├── settingForm.jsx
│   │   ├── stats.jsx
│   │   ├── title.jsx
│   │   ├── transferMoney.jsx
│   ├── libs
│   │   ├── apiCalls.js
│   │   ├── index.js
│   ├── pages
│   │   ├── konto.jsx
│   │   ├── logowanie.jsx
│   │   ├── panel.jsx
│   │   ├── rejestracja.jsx
│   │   ├── transakcje.jsx
│   │   ├── ustawienia.jsx
│   ├── store
│   │   ├── index.js
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
```

---

## Instalacja

### Backend

1. Skopiuj pliki projektu.
2. W katalogu `/backend` zainstaluj zależności:
   ```bash
   npm install
   ```
3. Utwórz plik `.env` i skonfiguruj zmienne środowiskowe:
   ```env
   DATABASE_URI=your_postgresql_uri
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```
4. Uruchom serwer backend:
   ```bash
   npm start
   ```

### Frontend

1. W katalogu `/frontend` zainstaluj zależności:
   ```bash
   npm install
   ```
2. Uruchom serwer frontend:
   ```bash
   npm start
   ```

---

## API

### Endpoints

1. **Autoryzacja**
   - `POST /api-v1/autoryzacja/rejestracja`
   - `POST /api-v1/autoryzacja/logowanie`
2. **Użytkownicy**
   - `GET /api-v1/uzytkownicy` (dane użytkownika)
   - `PUT /api-v1/uzytkownicy` (edycja danych)
   - `PUT /api-v1/uzytkownicy/zmiana-hasla`
3. **Konta**
   - `GET /api-v1/konta`
   - `POST /api-v1/konta/nowe-konto`
   - `PUT /api-v1/konta/dodaj-srodki/:id`
   - `PUT /api-v1/konta/transfer-srodkow`
   - `DELETE /api-v1/konta/:id`
4. **Transakcje**
   - `GET /api-v1/transakcje`
   - `POST /api-v1/transakcje/dodaj-transakcje/:id`

---

## Stylowanie

- Projekt wykorzystuje **Tailwind CSS** do responsywnego projektowania.
- **React Icons** służą do intuicyjnego i nowoczesnego interfejsu.

---

## Testowanie

- Wszystkie funkcjonalności można przetestować lokalnie poprzez uruchomienie backendu oraz frontendu w trybie deweloperskim.

---

## Uwagi

- Backend wymaga poprawnej konfiguracji zmiennych środowiskowych.
- Frontend korzysta z lokalnego zapisu sesji (localStorage) do przechowywania tokena użytkownika.

---

##
