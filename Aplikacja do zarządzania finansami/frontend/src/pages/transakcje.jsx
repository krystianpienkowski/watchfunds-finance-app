import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../libs/apiCalls";
import { toast } from "sonner";
import Title from "../components/title";
import { exportToExcel } from "react-json-to-excel";
import { PiListPlusFill } from "react-icons/pi";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import DateRange from "../components/dateRange";
import { IoSearchOutline } from "react-icons/io5";
import { formatCurrency } from "../libs";
import AddTransaction from "../components/AddTransactions";

const Transakcje = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");
  const startDate = searchParams.get("df") || "";
  const endDate = searchParams.get("dt") || "";

  const fetchTransactions = async () => {
    try {
      let endDateObj = new Date(endDate);

      if (isNaN(endDateObj.getTime())) {
        endDateObj = new Date();
      }

      const adjustedEndDate = endDateObj.toISOString().split("T")[0];

      const URL = `/transakcje?df=${startDate}&dt=${adjustedEndDate}&s=${search}`;
      const { data: res } = await api.get(URL);

      setData(res?.data);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Błąd");
      if (error?.response?.data?.status === "auth_failed") {
        localStorage.removeItem("user");
        window.location.reload();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    setSearchParams({
      df: startDate,
      dt: endDate,
    });
    setIsLoading(true);
    await fetchTransactions();
  };

  useEffect(() => {
    setIsLoading(true);
    fetchTransactions();
  }, [startDate, endDate]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full mt-10">
        Ładowanie
      </div>
    );

  return (
    <>
      <div className="w-full py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <Title text="Transakcje" />

          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <DateRange className="text-xs py-1 px-2" />

            <form
              onSubmit={(e) => handleSearch(e)}
              className="w-full md:w-auto mr-6"
            >
              <div className="flex items-center gap-1 border border-gray-300 rounded-md px-1 py-1">
                <IoSearchOutline className="text-sm text-gray-600" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Szukaj"
                  className="w-16 outline-none bg-transparent text-xs text-gray-700 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="text-white bg-niebieski hover:bg-blue-900 px-1 py-1 rounded-md flex items-center justify-center"
                >
                  <IoSearchOutline className="text-sm" />
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setIsOpen(true)}
            className="py-1 px-2 rounded text-white bg-niebieski flex items-center justify-center gap-1 text-sm hover:bg-blue-900"
          >
            <PiListPlusFill size={18} />
            <span>Transakcja</span>
          </button>

          <button
            onClick={() =>
              exportToExcel(data, `Transakcje od ${startDate} do ${endDate}`)
            }
            className="py-1 px-2 rounded text-white bg-niebieski flex items-center justify-center gap-2 text-sm ml-1 mr-6 hover:bg-blue-900"
          >
            Eksportuj <PiMicrosoftExcelLogoFill size={20} />
          </button>
        </div>
        <div className="overflow-x-auto mt-5 mx-10">
          {data?.length === 0 ? (
            <div className="w-full flex items-center justify-center py-10 text-gray-600 text-lg">
              <span>Brak transakcji</span>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="w-full border-b border-gray-300">
                  <tr className="w-full text-black text-left">
                    <th className="py-2">Data</th>
                    <th className="py-2 px-2">Opis</th>
                    <th className="py-2 px-2">Typ</th>
                    <th className="py-2 px-2">Konto</th>
                    <th className="py-2 px-2">Kwota</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((item, index) => (
                    <tr
                      key={index}
                      className="w-full border-b border-gray-200 text-gray-600 hover:bg-gray-300/10 text-sm md:text-sm"
                    >
                      <td className="py-2">
                        <p className="w-24 md:w-auto">
                          {new Date(item.createdat).toLocaleDateString(
                            "pl-PL",
                            {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex flex-col w-56 md:w-auto">
                          <p className="text-sm text-black line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          {item.description.startsWith("Transfer (") ? (
                            <span className="text-blue-600 font-semibold">
                              Transfer
                            </span>
                          ) : (
                            <>
                              {item.type === "income" && (
                                <span className="text-emerald-600 font-semibold">
                                  Przychód
                                </span>
                              )}
                              {item.type === "expense" && (
                                <span className="text-red-600 font-semibold">
                                  Wydatek
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2">{item?.source}</td>
                      <td
                        className={`py-2 px-2 text-sm font-medium ${
                          item.description.startsWith("Transfer (")
                            ? "text-black"
                            : item.type === "income"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        <span>{item?.type === "income" ? "+" : "-"}</span>
                        {formatCurrency(item?.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      <AddTransaction
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        refetch={fetchTransactions}
        key={new Date().getTime()}
      />
    </>
  );
};

export default Transakcje;
