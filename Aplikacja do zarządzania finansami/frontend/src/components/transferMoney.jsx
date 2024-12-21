import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BiLoader } from "react-icons/bi";
import api from "../libs/apiCalls";
import { formatCurrency } from "../libs";

const TransferMoney = ({ isOpen, setIsOpen, fromAccountId, refetch }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data: res } = await api.get("/konta");
        setAccounts(res?.data.filter((account) => account.id !== fromAccountId));
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("Wystąpił błąd podczas pobierania kont.");
      }
    };

    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, fromAccountId]);

  const submitHandler = async (data) => {
    try {
      setLoading(true);

      const payload = {
        from_account: fromAccountId,
        to_account: data.to_account,
        amount: data.amount,
      };

      const { data: res } = await api.put(`/transakcje/transfer-srodkow`, payload);

      if (res?.status === "success") {
        toast.success(res?.message);
        setIsOpen(false);
        refetch();
        reset();
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  function closeModal() {
    setIsOpen(false);
    reset();
  }

  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-10">
      <div className="fixed inset-0 bg-black bg-opacity-25" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl">
          <DialogTitle
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 mb-4"
          >
            Przelej środki
          </DialogTitle>

          <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Konto docelowe
              </label>

              <select
                {...register("to_account", {
                  required: "Wybór konta docelowego jest wymagany",
                })}
                onChange={(e) => {
                  const accountId = e.target.value;
                  setSelectedAccount(accountId);
                  const account = accounts.find((acc) => acc.id === accountId);
                  setAccountBalance(account ? account.account_balance : null);
                }}
                value={selectedAccount}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 outline-none focus:ring-1 ring-blue-500"
              >
                <option disabled value="">
                  Wybierz konto
                </option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name} -{" "}
                    {formatCurrency(account.account_balance)}
                  </option>
                ))}
              </select>

              {errors.to_account && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.to_account.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Kwota
              </label>
              <input
                type="number"
                placeholder="np. 200"
                {...register("amount", {
                  required: "Kwota jest wymagana",
                  min: {
                    value: 1,
                    message: "Kwota musi być większa niż 0",
                  },
                })}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 outline-none focus:ring-1 ring-blue-500"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="w-full mt-8">
              <button
                type="submit"
                className="w-full p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <BiLoader className="text-2xl text-white animate-spin" />
                ) : (
                  "Przelej środki"
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TransferMoney;
