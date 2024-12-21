import React, { useState } from "react";
import useStore from "../store";
import { useForm } from "react-hook-form";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { toast } from "sonner";
import api from "../libs/apiCalls";
import { BiLoader } from "react-icons/bi";

const accounts = ["Bank", "Revolut", "Paypal", "Gotówka"];

const AddAccount = ({ isOpen, setIsOpen, refetch }) => {
  const { user } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { account_number: "", amount: 0 },
  });
  const [selectedAccount, setSelectedAccount] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const newData = { ...data, name: selectedAccount || accounts[0] };

      const { data: res } = await api.post(`/konta/nowe-konto`, newData);
      if (res?.data) {
        toast.success(res?.message || "Konto zostało dodane pomyślnie.");
        setIsOpen(false);
        refetch();
      }
    } catch (error) {
      console.error("Coś poszło nie tak", error);
      toast.error(error?.response?.data?.message || "Coś poszło nie tak.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
      <div className="fixed inset-0 bg-white bg-opacity-40" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <DialogTitle
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 mb-4"
          >
            Dodaj konto
          </DialogTitle>

          {/* Formularz */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Sekcja wyboru rodzaju konta */}
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Wybierz rodzaj konta
              </label>
              <select
                value={selectedAccount || accounts[0]}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 outline-none focus:ring-1 ring-blue-500"
              >
                {accounts.map((acc, index) => (
                  <option key={index} value={acc} className="w-full">
                    {acc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sekcja opisu konta */}
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Wprowadź opis konta
              </label>
              <input
                type="text"
                placeholder="np. Oszczędności"
                {...register("account_number", {
                  required: "Opis jest wymagany",
                })}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 outline-none focus:ring-1 ring-blue-500"
              />
              {errors.account_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.account_number.message}
                </p>
              )}
            </div>

            {/* Sekcja salda początkowego */}
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Wprowadź saldo początkowe
              </label>
              <input
                type="number"
                placeholder="500"
                step="0.01"
                {...register("amount", {
                  required: "Saldo jest wymagane",
                })}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 outline-none focus:ring-1 ring-blue-500"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Przycisk Stwórz Konto */}
            <button
              type="submit"
              className="w-full p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              disabled={loading}
            >
              {loading && <BiLoader className="text-2xl text-white animate-spin" />}
              {!loading && "Stwórz konto"}
            </button>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AddAccount;
