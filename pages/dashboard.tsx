import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchEntries } from "../pages/api/firebase-utils"; // Firebase utility functions
import ChartProfit from "@/components/chartprofit";
import CumulativeChart from "@/components/chartcumulative";
import BalanceChart from "@/components/chartbalance";
import ExpensesDistribution from "@/components/chartExpences";

// Динамичен импорт за ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Entry {
  id: number;
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}

type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

type ChartData = {
  name: string;
  data: number[];
}[];

export default function Dashboard() {
  const [chartOptions, setChartOptions] = useState({});
  const [chartData, setChartData] = useState<ChartData>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: Record<string, Entry> = await fetchEntries();

        // Групиране на данните по месеци
        const groupedData = Object.values(data).reduce((acc: Record<string, MonthlyData>, entry: Entry) => {
          const date = new Date(entry.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM

          if (!acc[monthKey]) {
            acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
          }

          if (entry.type === "приход") {
            acc[monthKey].income += entry.amount;
          } else if (entry.type === "разход") {
            acc[monthKey].expense += entry.amount;
          }

          return acc;
        }, {});

        const sortedMonths = Object.keys(groupedData).sort(); // Сортиране на месеците
        const incomeData = sortedMonths.map((month) => groupedData[month].income);
        const expenseData = sortedMonths.map((month) => groupedData[month].expense);

        // Настройки за ApexCharts
        setChartOptions({
          chart: {
            type: "bar",
            height: 350,
            toolbar: {
              show: false,
            },
          },
          xaxis: {
            categories: sortedMonths, // Месеци
          },
          yaxis: {
            title: {
              text: "Лева",
            },
          },
          colors: ["#4CAF50", "#F44336"],
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "50%",
            },
          },
          legend: {
            position: "top",
          },
        });

        // Данни за графиката
        setChartData([
          {
            name: "Приходи",
            data: incomeData,
          },
          {
            name: "Разходи",
            data: expenseData,
          },
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Неуспешно зареждане на данните.");
      }
    };

    fetchData();
  }, []);

  return (
    <div >
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
          Dashboard - Приходи и Разходи
        </h1>
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <Chart options={chartOptions} series={chartData} type="bar" height={350} />
        )}
      </div>
      <br></br>
      <ChartProfit />
      <br></br>
      <CumulativeChart />
      <br></br>
      <BalanceChart />
      <br></br>
      <ExpensesDistribution />
    </div>
  );
}
