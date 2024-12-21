import React from "react";
import { IoWallet } from "react-icons/io5";
import { FaPiggyBank } from "react-icons/fa6";
import { PiHandCoinsBold } from "react-icons/pi";
import { formatCurrency } from "../libs";

const Stats = ({ dt }) => {
    return (
        <div className="max-w-3xl mx-auto flex justify-center items-center gap-10 px-4 md:px-6 py-7 rounded-lg bg-white border border-gray-200 shadow-md mb-10 mt-5">
            <div className="flex items-center gap-5">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-300 text-blue-800">
                    <FaPiggyBank size={25} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Twoje saldo</span>
                    <p className="font-semibold">{formatCurrency(dt?.balance)}</p>
                </div>
            </div>

            <div className="flex items-center gap-5">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-300 text-green-800">
                    <IoWallet size={25} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Miesięczne przychody</span>
                    <p className="font-semibold">{formatCurrency(dt?.income)}</p>
                </div>
            </div>

            <div className="flex items-center gap-5">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-300 text-red-800">
                    <PiHandCoinsBold size={25} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Miesięczne wydatki</span>
                    <p className="font-semibold">{formatCurrency(dt?.expense)}</p>
                </div>
            </div>
        </div>
    );
};

export default Stats;