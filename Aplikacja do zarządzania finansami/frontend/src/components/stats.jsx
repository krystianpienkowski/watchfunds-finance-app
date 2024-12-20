import React from "react";
import { IoWallet } from "react-icons/io5";
import { FaPiggyBank } from "react-icons/fa6";
import { PiHandCoinsBold } from "react-icons/pi";
import { formatCurrency } from "../libs";

const Stats = ({ dt }) => {
    const data = [
        {
            label: "Twoje saldo",
            amount: formatCurrency(dt?.balance),
            icon: <FaPiggyBank size={25} />
        },
        {
            label: "Twoje przychody",
            amount: formatCurrency(dt?.income),
            icon: <IoWallet size={25} />
        },
        {
            label: "Twoje wydatki",
            amount: formatCurrency(dt?.expense),
            icon: <PiHandCoinsBold size={25} />
        }
    ];

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 2xl:gap-20 mb-10 mt-5 ml-5 mr-5">
            {data.map((item, index) => (
                <div
                    key={index + item.label}
                    className="w-full 2xl:min-w-96 flex items-center justify-between gap-5 px-4 md:px-6 py-7 rounded-lg bg-white border border-gray-200 shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-300 text-blue-800">
                            {item.icon}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">{item.label}</span>
                            <p className="font-semibold">{item.amount}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Stats;
