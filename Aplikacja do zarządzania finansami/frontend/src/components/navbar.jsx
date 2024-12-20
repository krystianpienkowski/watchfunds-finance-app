import React, { useState } from "react";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "../assets";
import { FiMenu, FiX } from "react-icons/fi";

const links = [
  { name: "Panel", path: "/panel" },
  { name: "Konta", path: "/konta" },
  { name: "Transakcje", path: "/transakcje" },
  { name: "Ustawienia", path: "/ustawienia" },
];

const Navbar = () => {
  const [selected, setSelected] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/logowanie");
    window.location.reload();
  };

  return (
    <div className="w-full flex items-center justify-between py-2 bg-white border-b border-gray-200 shadow-sm relative">
      <div className="flex items-center gap-2 cursor-pointer ml-6">
        <div className="w-10 h-10 flex items-center justify-center bg-niebieski">
          <FaMoneyBillTransfer className="text-white text-3xl" />
        </div>
        <span className="text-lg font-bold text-niebieski text-outline hidden md:block">
          WatchFunds
        </span>
      </div>

      {/* Ikona hamburgera dla wersji mobilnej */}
      <div className="md:hidden mr-6">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FiX className="text-3xl" /> : <FiMenu className="text-3xl" />}
        </button>
      </div>

      {/* Linki dla wersji desktopowej */}
      <div className="hidden md:flex items-center gap-2 mr-20 font-medium text-sm">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className={`${
              index === selected ? " text-black" : "text-gray-400"
            } px-3 py-1 rounded-2xl cursor-pointer`}
            onClick={() => setSelected(index)}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Rozwijalne menu dla wersji mobilnej */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md z-10 md:hidden">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="block px-4 py-2 text-niebieski border-b border-gray-200"
              onClick={() => {
                setSelected(index);
                setIsMobileMenuOpen(false);
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}

      {/* Profil użytkownika i wylogowanie */}
      <div className="flex items-center gap-10 2xl:gap-20 relative">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleDropdownClick}>
          <img
            src={Avatar}
            alt="User"
            className="w-8 md:w-10 h-8 md:h-10 rounded-full object-cover"
          />
          <div className="mr-6">
            <MdOutlineKeyboardArrowDown
              className={`hidden md:block text-2xl transform transition-transform duration-200 ${
                isDropdownOpen ? "-rotate-90" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 bg-white shadow-md rounded-md py-2 px-4 mr-4">
            <span
              onClick={handleLogout}
              className="block text-red-500 hover:text-red-700 cursor-pointer"
            >
              Wyloguj
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
