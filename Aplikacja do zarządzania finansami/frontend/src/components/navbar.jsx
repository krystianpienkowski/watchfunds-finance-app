import React, { useEffect, useState } from "react";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { Avatar } from "../assets";

const links = [
  { name: "Panel", path: "/panel" },
  { name: "Konta", path: "/konta" },
  { name: "Transakcje", path: "/transakcje" },
  { name: "Ustawienia", path: "/ustawienia" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({ firstName: "", lastName: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setUser({ firstName: userData.firstname, lastName: userData.lastname });
        } else {
            toast.error("User not found. Redirecting to login.");
            localStorage.removeItem("user");
            window.location.reload();
        }
    } catch (error) {
        console.error("Błąd pobierania użytkownika", error);
        toast.error("Błąd pobierania użytkownika");
        localStorage.removeItem("user");
        window.location.reload();
    } finally {
        setIsLoading(false);
    }
};

useEffect(() => {
    fetchUser();
}, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div className="w-full flex items-center justify-between py-2 bg-white border-b border-gray-200 shadow-sm relative">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer ml-6">
        <div className="w-10 h-10 flex items-center justify-center bg-niebieski">
          <FaMoneyBillTransfer className="text-white text-3xl" />
        </div>
        <span className="text-lg font-bold text-niebieski text-outline hidden md:block">
          WatchFunds
        </span>
      </div>

      {/* Linki wyśrodkowane */}
      <div className="hidden md:flex items-center gap-4 font-medium text-sm mx-auto">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className={`${
              location.pathname.startsWith(link.path) ? " text-black" : "text-gray-400"
            } px-2 py-1 rounded-2xl cursor-pointer`}
          >
            {link.name}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="text-gray-400 px-2 py-1 mr-8 rounded-2xl cursor-pointer hover:text-red-500"
        >
          Wyloguj
        </button>
      </div>

      {/* Ikona hamburgera dla wersji mobilnej */}
      <div className="md:hidden mr-6">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FiX className="text-3xl" /> : <FiMenu className="text-3xl" />}
        </button>
      </div>

      {/* Rozwijalne menu dla wersji mobilnej */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md z-10 md:hidden">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className={`block px-4 py-2 ${
                location.pathname.startsWith(link.path) ? "text-black" : "text-niebieski"
              } border-b border-gray-200`}
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
          >
            Wyloguj
          </button>
        </div>
      )}

      {/* Profil użytkownika */}
      <div className="flex items-center gap-2 mr-5">
        <img
          src={Avatar}
          alt="User"
          className="w-6 md:w-8 h-6 md:h-8 rounded-full object-cover"
        />
        <span className="hidden md:block font-medium text-gray-700 text-sm">
          {`${user.firstName} ${user.lastName}`}
        </span>
      </div>
    </div>
  );
};

export default Navbar;
