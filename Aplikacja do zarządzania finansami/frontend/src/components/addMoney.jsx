import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BiLoader } from "react-icons/bi";
import api from "../libs/apiCalls";
import { formatCurrency } from "../libs";

const AddMoney = ({ isOpen, setIsOpen, id, refetch }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const [loading, setLoading] = useState(false);

  const submitHandler = async (data) => {
    try {
      setLoading(true);

      const { data: res } = await api.put(`/konta/dodaj-srodki/${id}`, data);

      if (res?.data) {
        toast.success(res?.message);
        setIsOpen(false);
        refetch();
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
  }

  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-10">
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl">
          <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4 ">
            Dodaj środki
          </DialogTitle>

          <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            {/* Sekcja dodawania kwoty */}
            <div>
              <label className="block text-sm font-medium text-gray-500"></label>
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
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>

            {/* Przycisk Dodaj Kwotę */}
            <div className="w-full mt-8">
              <button
                type="submit"
                className="w-full p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <BiLoader className="text-2xl text-white animate-spin" />
                ) : (
                  "Dodaj kwotę"
                )}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AddMoney;
