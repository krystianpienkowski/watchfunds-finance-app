import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Title from "./title";

const Chart = ({ chartData }) => {
  // Sprawdzenie, czy dane są dostępne
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <span>Brak danych do wyświetlenia</span>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
        <Title text="Ten tydzień" />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 30, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}  
            angle={-45} textAnchor="end"
          />
          <YAxis />
          <Tooltip />
          {/* <Legend /> */}
          <Bar dataKey="income" fill="#82ca9d" name="Przychody" />
          <Bar dataKey="expense" fill="#ff6666" name="Wydatki" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
