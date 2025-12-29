import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchEntries } from "../lib/firebase-utils"; // Firebase utility functions
import ChartProfit from "@/components/chartprofit";
import CumulativeChart from "@/components/chartcumulative";
import BalanceChart from "@/components/chartbalance";
import ExpensesDistribution from "@/components/chartExpences";
import { useRouter } from "next/router";

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
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const router = useRouter();

  useEffect(() => {

    
   
        const isLoggedIn = sessionStorage.getItem("loggedIn");
        if (!isLoggedIn) {
          router.push("/login"); // Redirect to login if not logged in
        }
      
      
    const fetchData = async () => {
      try {
        const allData: Record<string, Entry> = await fetchEntries();

        // Filter entries by selected year
        const filteredEntries = Object.values(allData).filter(entry => {
          const entryYear = new Date(entry.date).getFullYear();
          return entryYear === selectedYear;
        });

        // Групиране на данните по месеци
        const groupedData = filteredEntries.reduce((acc: Record<string, MonthlyData>, entry: Entry) => {
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
              text: getCurrencySymbol(selectedYear),
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
  },  [router, selectedYear]);

  // Get currency symbol based on year
  const getCurrencySymbol = (year: number) => {
    return year < 2026 ? "лв" : "€";
  };

  // Generate year options from entries (we'll fetch all entries to get years)
  const [allEntries, setAllEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const loadAllEntries = async () => {
      try {
        const data: Record<string, Entry> = await fetchEntries();
        setAllEntries(Object.values(data));
      } catch (err) {
        console.error("Error loading entries:", err);
      }
    };
    loadAllEntries();
  }, []);

  const yearOptions = Array.from(
    new Set(allEntries.map(entry => new Date(entry.date).getFullYear()))
  ).sort((a, b) => b - a);

  if (!yearOptions.includes(new Date().getFullYear())) {
    yearOptions.unshift(new Date().getFullYear());
  }

  // Calculate summary totals for selected year
  const totalIncome = allEntries
    .filter(entry => new Date(entry.date).getFullYear() === selectedYear)
    .filter(entry => entry.type === "приход")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = allEntries
    .filter(entry => new Date(entry.date).getFullYear() === selectedYear)
    .filter(entry => entry.type === "разход")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const profit = totalIncome - totalExpenses;

  return (
    <div >
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-700">
            Dashboard - Приходи и Разходи
          </h1>
          <div className="flex items-center gap-2">
            <label className="text-gray-600">Година:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg p-2"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Обобщение за {selectedYear} година
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-600 font-medium">Общ приход</div>
              <div className="text-xl font-bold text-green-700">
                {totalIncome.toFixed(2)} {getCurrencySymbol(selectedYear)}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-600 font-medium">Общ разход</div>
              <div className="text-xl font-bold text-red-700">
                {totalExpenses.toFixed(2)} {getCurrencySymbol(selectedYear)}
              </div>
            </div>
            <div className={`border rounded-lg p-3 ${profit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className={`text-sm font-medium ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Печалба до момента
              </div>
              <div className={`text-xl font-bold ${profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {profit.toFixed(2)} {getCurrencySymbol(selectedYear)}
              </div>
            </div>
          </div>
        </div>

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
