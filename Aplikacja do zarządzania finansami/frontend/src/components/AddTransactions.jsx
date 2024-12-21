import { DialogPanel, DialogTitle, Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdOutlineWarning } from "react-icons/md";
import { toast } from "sonner";
import { formatCurrency } from "../libs";
import useStore from "../store";
import api from "../libs/apiCalls";

const AddTransaction = ({ isOpen, setIsOpen, refetch }) => {
  const { user } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [accountBalance, setAccountBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState([]);
  const [accountInfo, setAccountInfo] = useState({});
  const [selectedAccount, setSelectedAccount] = useState("");

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const newData = { ...data, source: accountInfo.account_name };

      const { data: res } = await api.post(
        `/transakcje/dodaj-transakcje/${accountInfo.id}`,
        newData
      );
      if (res?.status === "success") {
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

  const getAccountBalance = (val) => {
    const filteredAccount = accountData?.find(
      (account) => account.account_name === val
    );

    setAccountBalance(filteredAccount ? filteredAccount.account_balance : 0);
    setAccountInfo(filteredAccount);
    console.log("Selected Account Info:", accountInfo);
  };

  function closeModal() {
    setIsOpen(false);
  }

  const fetchAccounts = async () => {
    try {
      const { data: res } = await api.get(`/konta`);

      setAccountData(res?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-10">
      <div className="fixed inset-0 bg-white bg-opacity-40" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white  p-6 text-left align-middle shadow-xl transition-all">
          <DialogTitle
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900  mb-4 "
          >
            Dodaj transakcję
          </DialogTitle>

          <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Wybierz konto
              </label>

              <select
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  getAccountBalance(e.target.value);
                }}
                value={selectedAccount}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 outline-none focus:ring-1 ring-blue-500"
              >
                <option disabled value="">
                  Wybierz konto
                </option>
                {accountData?.map((acc, index) => (
                  <option
                    key={index}
                    value={acc?.account_name}
                    className="w-full"
                  >
                    {acc?.account_name}
                    {" - "}
                    {formatCurrency(
                      acc?.account_balance,
                      user?.country?.currency
                    )}
                  </option>
                ))}
              </select>
            </div>

            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opis
                </label>
                <input
                  name="description"
                  placeholder="Zakupy spożywcze"
                  {...register("description", {
                    required: "Napisz opis",
                  })}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 outline-none focus:ring-1 ring-blue-500"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kwota
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="13.50"
                  step="0.01"
                  {...register("amount", {
                    required: "Wpisz kwotę",
                  })}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 outline-none focus:ring-1 ring-blue-500"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="w-full mt-6">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  {`Potwierdź`}
                </button>
              </div>
            </>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AddTransaction;
