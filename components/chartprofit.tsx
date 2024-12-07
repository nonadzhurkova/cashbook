import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchEntries } from "../pages/api/firebase-utils"; // Firebase utility functions

// Динамичен импорт за ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Entry {
  id: string;
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}

interface ChartSeries {
  name: string;
  data: number[];
}

export default function ChartProfit() {
  const [chartOptions, setChartOptions] = useState({});
  const [chartData, setChartData] = useState<ChartSeries[]>([]); // Дефиниране на типа
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: Record<string, Entry> = await fetchEntries();

        // Групиране по дата
        const groupedData = Object.values(data).reduce(
          (acc: Record<string, { income: number; expense: number }>, entry: Entry) => {
            const dateKey = new Date(entry.date).toISOString().split("T")[0]; // YYYY-MM-DD
            if (!acc[dateKey]) acc[dateKey] = { income: 0, expense: 0 };

            if (entry.type === "приход") acc[dateKey].income += entry.amount;
            if (entry.type === "разход") acc[dateKey].expense += entry.amount;

            return acc;
          },
          {}
        );

        // Сортиране на датите
        const sortedDates = Object.keys(groupedData).sort();

        // Създаване на данни за графиката
        const incomeData = sortedDates.map((date) => parseFloat(groupedData[date].income.toFixed(2)));
        const expenseData = sortedDates.map((date) => parseFloat(groupedData[date].expense.toFixed(2)));

        // Настройки за графиката
        setChartOptions({
          chart: {
            type: "area",
            height: 350,
            toolbar: {
              show: false,
            },
          },
          xaxis: {
            categories: sortedDates, // Масив с дати
            title: { text: "Дата" },
          },
          yaxis: {
            title: { text: "Сума (лв)" },
          },
          colors: ["#4CAF50", "#F44336"], // Приходи (зелено) и Разходи (червено)
          stroke: {
            curve: "smooth",
          },
          legend: {
            position: "top",
          },
          tooltip: {
            x: { format: "dd MMM yyyy" },
          },
        });

        // Актуализиране на данните
        setChartData([
          { name: "Приходи", data: incomeData },
          { name: "Разходи", data: expenseData },
        ]);
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
        Dashboard - Приходи и Разходи
      </h1>
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <Chart options={chartOptions} series={chartData} type="area" height={350} />
      )}
    </div>
  );
}
