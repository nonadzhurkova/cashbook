import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UpcomingExpensesSummary from "../components/upcomingexpencessummary";
import BookingsSummary from "../components/bookingssummary";
import ProfitSummary from "../components/profitsummary";
import ExpenseStatistics from "../components/expensestatistics";

export default function Home() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("loggedIn");
    if (!isLoggedIn) {
      router.push("/login"); // Redirect to login if not logged in
    }
  }, [router])

  // Generate year options from current year back to 2020
  const yearOptions = [];
  for (let year = new Date().getFullYear(); year >= 2020; year--) {
    yearOptions.push(year);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Начало</h1>
              <p className="text-gray-600">Добре дошли в системата за управление на касовата книга</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-600 font-medium">Година:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings Summary - First, spans full width */}
          <div className="lg:col-span-3">
            <BookingsSummary />
          </div>

          {/* Profit Summary - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <ProfitSummary selectedYear={selectedYear} />
          </div>

          {/* Upcoming Expenses - Takes up 1 column */}
          <div>
            <UpcomingExpensesSummary />
          </div>

          {/* Expense Statistics - Spans full width */}
          <div className="lg:col-span-3">
            <ExpenseStatistics selectedYear={selectedYear} />
          </div>
        </div>
      </div>
    </div>
  );
}
