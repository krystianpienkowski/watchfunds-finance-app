import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Text,
} from "recharts";
import Title from "./title";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload[0]?.value || 0;
    const expense = payload[1]?.value || 0;
    const diff = income - expense;
    const diffPercent = income ? ((diff / income) * 100).toFixed(2) : 0;

    return (
      <div className="bg-white p-3 shadow-md rounded border border-gray-300">
        <p className="text-gray-700 font-semibold">{label}</p>
        <p className="text-green-600">Przychody: {income}</p>
        <p className="text-red-600">Wydatki: {expense}</p>
        <p className={`font-semibold ${diff > 0 ? "text-green-500" : "text-red-500"}`}>
          Różnica: {diff} ({diffPercent}%)
        </p>
      </div>
    );
  }
  return null;
};

const Chart = ({ chartData }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <span>Brak danych do wyświetlenia</span>
      </div>
    );
  }

  const maxIncome = Math.max(...chartData.map((d) => d.income || 0));
  const maxExpense = Math.max(...chartData.map((d) => d.expense || 0));

  return (
    <div className="w-full h-96">
      <Title text="Ten tydzień" />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend align="center" iconType="circle" wrapperStyle={{ bottom: 0 }} />
          <Bar
            dataKey="income"
            fill="url(#incomeGradient)"
            name="Przychody"
            radius={[10, 10, 0, 0]}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <text
                key={`income-${index}`}
                x={entry.income === maxIncome ? 15 : 0}
                y={-10}
                fontSize="12"
                fill="#000"
                fontWeight="bold"
              >
                {entry.income === maxIncome && "Max"}
              </text>
            ))}
          </Bar>
          <Bar
            dataKey="expense"
            fill="url(#expenseGradient)"
            name="Wydatki"
            radius={[10, 10, 0, 0]}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <text
                key={`expense-${index}`}
                x={entry.expense === maxExpense ? 15 : 0}
                y={-10}
                fontSize="12"
                fill="#000"
                fontWeight="bold"
              >
                {entry.expense === maxExpense && "Max"}
              </text>
            ))}
          </Bar>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#82ca9d" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6666" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#ff6666" stopOpacity={0.5} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
