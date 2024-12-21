import React, { useEffect, useState } from "react";
import Stats from "../components/stats";
import api from "../libs/apiCalls";
import { toast } from "sonner";
import Chart from "../components/chart";

const Panel = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardStats = async () => {
    const URL = `/transakcje/panel`;
    try {
      const { data } = await api.get(URL);
      setData(data);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Coś poszło nie tak");

      if (error?.response?.data?.status === "auth_failed") {
        localStorage.removeItem("user");
        window.location.reload();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchDashboardStats();
  }, []);

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full mt-10">
        Ładowanie
      </div>
    );

  return (
    <div>
      <div>
        <Stats
          dt={{
            balance: data?.availableBalance,
            income: data?.totalIncome,
            expense: data?.totalExpense,
          }}
        />
        <Chart chartData={data?.chartData} />
      </div>
    </div>
  );
};

export default Panel;
