import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchEntries } from "../lib/firebase-utils";

interface Entry {
  id: string;
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}

interface ProfitSummaryProps {
  selectedYear?: number;
}

export default function ProfitSummary({ selectedYear }: ProfitSummaryProps) {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = selectedYear || new Date().getFullYear();

  useEffect(() => {
    loadProfitData();
  }, [currentYear]);

  const loadProfitData = async () => {
    setIsLoading(true);
    try {
      const data: Record<string, Entry> = await fetchEntries();
      const entries = Object.values(data);

      // Filter entries for current year
      const currentYearEntries = entries.filter(entry =>
        new Date(entry.date).getFullYear() === currentYear
      );

      const income = currentYearEntries
        .filter(entry => entry.type === "приход")
        .reduce((sum, entry) => sum + entry.amount, 0);

      const expenses = currentYearEntries
        .filter(entry => entry.type === "разход")
        .reduce((sum, entry) => sum + entry.amount, 0);

      setTotalIncome(income);
      setTotalExpenses(expenses);
    } catch (error) {
      console.error("Error loading profit data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const profit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  // Get currency symbol based on year
  const getCurrencySymbol = (year: number) => {
    return year < 2026 ? "лв" : "€";
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Печалба {currentYear}</h2>
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Подробно →
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-center">Зареждане...</p>
      ) : (
        <div className="space-y-4">
          {/* Main Profit Display */}
          <div className={`text-center p-6 rounded-lg ${profit >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            <div className={`text-3xl font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {profit >= 0 ? '+' : ''}{profit.toFixed(2)} {getCurrencySymbol(currentYear)}
            </div>
            <div className={`text-sm mt-1 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profit >= 0 ? 'Печалба' : 'Загуба'}
            </div>
            {profitMargin !== 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Марж: {profitMargin.toFixed(1)}%
              </div>
            )}
          </div>

          {/* Income and Expenses Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                +{totalIncome.toFixed(2)}
              </div>
              <div className="text-sm text-green-600">Приходи</div>
              <div className="text-xs text-gray-500">{getCurrencySymbol(currentYear)}</div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-700">
                -{totalExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-red-600">Разходи</div>
              <div className="text-xs text-gray-500">{getCurrencySymbol(currentYear)}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <Link
              href="/cashbook"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition text-center block font-medium"
            >
              ➕ Добави приход/разход
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
