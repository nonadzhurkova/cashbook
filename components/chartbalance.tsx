import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchEntries } from "../lib/firebase-utils"; // Firebase utility functions

// Динамичен импорт за ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Entry {
  id: string;
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}

export default function BalanceChart() {
  const [chartOptions, setChartOptions] = useState({});
  const [chartData, setChartData] = useState<{ name: string; data: number[] }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: Record<string, Entry> = await fetchEntries();

        // Групиране на данните по месеци
        const groupedData = Object.values(data).reduce(
          (acc: Record<string, { income: number; expense: number }>, entry: Entry) => {
            const monthKey = new Date(entry.date).toISOString().slice(0, 7); // YYYY-MM
            if (!acc[monthKey]) acc[monthKey] = { income: 0, expense: 0 };

            if (entry.type === "приход") acc[monthKey].income += entry.amount;
            if (entry.type === "разход") acc[monthKey].expense += entry.amount;

            return acc;
          },
          {}
        );

        // Сортиране на месеците
        const sortedMonths = Object.keys(groupedData).sort();

        // Изчисляване на салдото
        const balanceData = sortedMonths.map(
          (month) => groupedData[month].income - groupedData[month].expense
        );

        // Настройки за графиката
        setChartOptions({
          chart: {
            type: "bar",
            height: 350,
            toolbar: {
              show: false,
            },
          },
          xaxis: {
            categories: sortedMonths.map((month) => {
              const [year, m] = month.split("-");
              return `${year}-${m}`;
            }), // Масив с месеци във формат YYYY-MM
            title: { text: "Месец" },
          },
          yaxis: {
            title: { text: "Салдо (лв)" },
          },
          colors: ["#4CAF50", "#F44336"], // Зелено за положително, червено за отрицателно салдо
          plotOptions: {
            bar: {
              colors: {
                ranges: [
                  { from: -Infinity, to: 0, color: "#F44336" }, // Червено за отрицателни стойности
                  { from: 0, to: Infinity, color: "#4CAF50" }, // Зелено за положителни стойности
                ],
              },
            },
          },
          tooltip: {
            x: { format: "MMM yyyy" },
          },
        });

        // Данни за графиката
        setChartData([{ name: "Салдо", data: balanceData }]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Неуспешно зареждане на данните.");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
        Графика на Салдо по Месеци
      </h1>
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <Chart options={chartOptions} series={chartData} type="bar" height={350} />
      )}
    </div>
  );
}
