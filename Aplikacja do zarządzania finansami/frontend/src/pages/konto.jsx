import React, { useEffect, useState } from "react";
import useStore from "../store";
import { AiFillBank } from "react-icons/ai";
import { SiRevolut } from "react-icons/si";
import { FaCcPaypal } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { BiTransfer } from "react-icons/bi";
import { BiPlusCircle } from "react-icons/bi";
import { RiDeleteBinLine } from "react-icons/ri";
import api from "../libs/apiCalls";
import { toast } from "sonner";
import Title from "../components/title";
import { MdAdd } from "react-icons/md";
import { formatCurrency } from "../libs";
import AddAccount from "../components/addAccount";
import { BiLoader } from "react-icons/bi";
import AddMoney from "../components/addMoney";
import TransferMoney from "../components/transferMoney";

const ICONS = {
  bank: (
    <div className="w-12 h-12 bg-blue-700 text-white flex items-center justify-center rounded-full">
      <AiFillBank size={26} />
    </div>
  ),
  revolut: (
    <div className="w-12 h-12 bg-blue-700 text-white flex items-center justify-center rounded-full">
      <SiRevolut size={26} />
    </div>
  ),
  paypal: (
    <div className="w-12 h-12 bg-blue-700 text-white flex items-center justify-center rounded-full">
      <FaCcPaypal size={26} />
    </div>
  ),
  gotówka: (
    <div className="w-12 h-12 bg-blue-700 text-white flex items-center justify-center rounded-full">
      <BsCashCoin size={26} />
    </div>
  ),
};

const Konta = () => {
  const { user } = useStore((state) => state);

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTopup, setIsOpenTopup] = useState(false);
  const [isOpenTransfer, setIsOpenTransfer] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      const { data: res } = await api.get(`/konta`);
      setData(res?.data);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
      if (error?.response?.data?.status === "auth_failed") {
        localStorage.removeItem("user");
        window.location.reload();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddMoney = (el) => {
    setSelectedAccount(el?.id);
    setIsOpenTopup(true);
    console.log("Selected account:", el?.id);
    console.log("isOpenTopup set to true");
  };

  const handleTransferMoney = (el) => {
    setSelectedAccount(el?.id);
    setIsOpenTransfer(true);
    console.log("Selected account for transfer:", el?.id);
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      setIsLoading(true);
      const { data: res } = await api.delete(`/konta/${accountId}`);

      if (res?.status === "success") {
        toast.success(res?.message || "Konto zostało pomyślnie usunięte.");
        fetchAccounts();
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(
        error?.response?.data?.message ||
          "Wystąpił błąd podczas usuwania konta."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAccounts();
  }, []);

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full mt-10">
        <BiLoader className="text-2xl text-white animate-spin" />
      </div>
    );

  return (
    <>
      <div className="w-full py-4">
        <div className="flex items-center justify-between mb-2">
          <Title text="Twoje konta" />
        </div>

        <div className="w-full max-w-screen-lg mx-auto mb-2">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full h-10 flex items-center justify-center gap-2 bg-gray-50 text-gray-300 text-xl font-bold p-2 rounded shadow hover:bg-gray-100 transition-all"
          >
            <MdAdd size={28} />
            <span>Dodaj</span>
          </button>
        </div>

        {data?.length === 0 ? (
          <div className="w-full flex items-center justify-center py-4 text-gray-600 text-lg">
            <span>Nie posiadasz kont</span>
          </div>
        ) : (
          <div className="w-full max-w-screen-lg mx-auto grid grid-cols-1 py-4 gap-3 ">
            {data?.map((acc, index) => (
              <div
                key={index}
                className="w-full h-24 flex items-center gap-4 bg-gray-50 p-3 rounded shadow hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div>{ICONS[acc?.account_name?.toLowerCase()]}</div>
                  <div className="space-y-1">
                    <p className="text-black text-lg font-bold">
                      {acc?.account_name}
                    </p>
                    <span className="text-gray-600 text-sm font-light">
                      {acc?.account_number}
                    </span>
                  </div>
                </div>

                <div className="flex-1 text-right pr-20">
                  <p className="text-xl text-gray-700 font-medium tabular-nums">
                    {formatCurrency(acc?.account_balance)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTransferMoney(acc)}
                    className="text-gray-600 hover:text-blue-600 transition-all"
                  >
                    <BiTransfer size={24} />
                  </button>

                  <button
                    onClick={() => handleOpenAddMoney(acc)}
                    className="text-gray-600 hover:text-green-600 transition-all"
                  >
                    <BiPlusCircle size={24} />
                  </button>

                  <button
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="text-red-600 hover:text-red-800 transition-all"
                  >
                    <RiDeleteBinLine size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddAccount
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        refetch={fetchAccounts}
        key={new Date().getTime()}
      />

      <AddMoney
        isOpen={isOpenTopup}
        setIsOpen={setIsOpenTopup}
        id={selectedAccount}
        refetch={fetchAccounts}
        key={new Date().getTime() + 1}
      />

      <TransferMoney
        isOpen={isOpenTransfer}
        setIsOpen={setIsOpenTransfer}
        fromAccountId={selectedAccount}
        refetch={fetchAccounts}
        key={new Date().getTime() + 2}
      />
    </>
  );
};

export default Konta;
