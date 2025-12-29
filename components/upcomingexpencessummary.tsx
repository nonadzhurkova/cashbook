import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUpcomingEntries } from "../lib/firebase-utils";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "Яна" | "Others";
}

export default function UpcomingExpensesSummary() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUpcomingEntries();
      const sortedData = Object.entries(data || {}).map(([id, expense]) => {
        const { id: _, ...rest } = expense as Expense;
        return {
          id,
          ...rest,
        };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Only show next 5 upcoming expenses
      setExpenses(sortedData.slice(0, 5));
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get currency symbol based on year
  const getCurrencySymbol = (year: number) => {
    return year < 2026 ? "лв" : "€";
  };

  // Calculate total upcoming expenses
  const totalUpcoming = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Предстоящи разходи</h2>
        <Link
          href="/upcoming-expenses"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Виж всички →
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-center">Зареждане...</p>
      ) : expenses.length > 0 ? (
        <div>
          <div className="space-y-3 mb-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{expense.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString('bg-BG')} • {expense.type}
                  </div>
                </div>
                <div className="text-lg font-semibold text-red-600">
                  {expense.amount.toFixed(2)} {getCurrencySymbol(new Date(expense.date).getFullYear())}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Общо предстоящи:</span>
              <span className="text-xl font-bold text-red-600">
                {totalUpcoming.toFixed(2)} {totalUpcoming > 0 ? getCurrencySymbol(new Date(expenses[0]?.date).getFullYear()) : 'лв'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">Няма предстоящи разходи</p>
          <Link
            href="/upcoming-expenses"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Добави разход →
          </Link>
        </div>
      )}
    </div>
  );
}
