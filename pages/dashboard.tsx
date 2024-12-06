/* import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MonthlyData {
  income: number;
  expense: number;
}

export default function Dashboard() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    const res = await fetch("/api/cash-book?summary=yearly");
    const data = await res.json();
    setMonthlyData(data);
  };

  const chartData = {
    labels: [
      "Януари",
      "Февруари",
      "Март",
      "Април",
      "Май",
      "Юни",
      "Юли",
      "Август",
      "Септември",
      "Октомври",
      "Ноември",
      "Декември",
    ],
    datasets: [
      {
        label: "Приходи",
        data: monthlyData.map((data) => data.income),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Разходи",
        data: monthlyData.map((data) => data.expense),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Navbar />
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">Dashboard</h1>
        <Bar
            data={chartData}
            options={{
            responsive: true,
            plugins: {
                legend: {
                position: "top" as const,
                },
                title: {
                display: true,
                text: "Приходи и Разходи по Месеци",
                },
            },
            }}
        />
        </div>
    </div>
  );
}
*/