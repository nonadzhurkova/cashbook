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

export default function ExpensesDistribution() {
  const [chartOptions, setChartOptions] = useState({});
  const [chartData, setChartData] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: Record<string, Entry> = await fetchEntries();

        // Групиране на разходите по описания
        const groupedData = Object.values(data)
          .filter((entry) => entry.type === "разход")
          .reduce(
            (acc: Record<string, number>, entry: Entry) => {
              if (!acc[entry.description]) {
                acc[entry.description] = 0;
              }
              acc[entry.description] += entry.amount;
              return acc;
            },
            {}
          );

        const labels = Object.keys(groupedData); // Описания на разходите
        const values = Object.values(groupedData); // Сума на разходите

        // Настройки за графиката
        setChartOptions({
          chart: {
            type: "donut",
            height: 350,
          },
          labels, // Описания на разходите като етикети
          legend: {
            position: "bottom",
          },
          tooltip: {
            y: {
              formatter: (value: number) => `${value.toFixed(2)} лв`,
            },
          },
        });

        // Данни за графиката
        setChartData(values);
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
        Разпределение на Разходите
      </h1>
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <Chart options={chartOptions} series={chartData} type="donut" height={350} />
      )}
    </div>
  );
}
