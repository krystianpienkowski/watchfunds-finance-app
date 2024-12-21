import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getDateSevenDaysAgo } from "../libs";

const DateRange = () => {
  const sevenDaysAgo = getDateSevenDaysAgo();

  const [searchParams, setSearchParams] = useSearchParams();

  

  const [dateFrom, setDateFrom] = useState(() => {
    const df = searchParams.get("df");

    return df && new Date(df).getTime() <= new Date().getTime()
      ? df
      : sevenDaysAgo || new Date().toISOString().split("T")[0];
  });

  const [dateTo, setDateTo] = useState(() => {
    const dt = searchParams.get("dt");

    return dt && new Date(dt).getTime() >= new Date(dateFrom).getTime()
      ? dt
      : new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    setSearchParams({ df: dateFrom, dt: dateTo });
  }, [dateFrom, dateTo]);

  const handleDateFromChange = (e) => {
    const df = e.target.value;
    setDateFrom(df);
    if (new Date(df).getTime() > new Date(dateTo).getTime()) {
    setDateTo(df);
    }
  }

    const handleDateToChange = (e) => {
    const dt = e.target.value;
    setDateTo(dt);
    if (new Date(dt).getTime() < new Date(dateFrom).getTime()) {
        setDateFrom(dt);
    }
    };

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <label
            className="block text-gray-700 text-sm mb-2"
            htmlFor="dateFrom"
          >
            Od
          </label>
          <input
            className="w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-500 border border-gray-300 rounded-md px-2 py-1"
            name="dateFrom"
            type="date"
            max={dateTo}
            value={dateFrom}
            onChange={handleDateFromChange}
          />
        </div>
    
        <div className="flex items-center gap-1">
          <label
            className="block text-gray-700 text-sm mb-2"
            htmlFor="dateTo"
          >
            Do
          </label>
          <input
            className="w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-500 border border-gray-300 rounded-md px-2 py-1"
            name="dateTo"
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={handleDateToChange}
          />
        </div>
      </div>
    );
    
  };

export default DateRange