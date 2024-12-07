import { useState, useEffect } from "react";
import {
  fetchUpcomingEntries,
  fetchUpcomingExpense,
  addUpcomingEntry,
  deleteUpcomingEntry,
  copyToCashBook,
} from "../pages/api/firebase-utils";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export default function UpcomingExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
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
      });
      setExpenses(sortedData);
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !description || !date) {
      alert("Моля, попълнете всички полета!");
      return;
    }

    const newExpense = {
      date,
      description,
      amount: parseFloat(amount),
    };

    try {
      await addUpcomingEntry(newExpense);
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      loadExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteUpcomingEntry(id);
      loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Неуспешно изтриване!");
    }
  };

  const handleCopyToCashBook = async (id: string) => {
    try {
      const expense = await fetchUpcomingExpense(id);
      if (expense) {
        const copiedExpense = {
          ...expense,
          date: new Date().toISOString().split("T")[0],
          type: "разход",
        };
        await copyToCashBook(copiedExpense);
        alert("Записът е копиран в Касова книга!");
      } else {
        alert("Записът не е намерен!");
      }
    } catch (error) {
      console.error("Error copying expense:", error);
      alert("Грешка при копиране на записа!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
        Предстоящи разходи
      </h1>

      {/* Form for Adding Expenses */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          />
          <input
            type="number"
            placeholder="Сума"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          />
        </div>
        <button
          onClick={handleAddExpense}
          className="mt-4 w-full bg-indigo-700 text-white py-2 rounded-lg hover:bg-indigo-900 transition"
        >
          Добави разход
        </button>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="text-gray-500 text-center">Зареждане...</p>
        ) : (
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Дата</th>
                <th className="px-4 py-2 border">Описание</th>
                <th className="px-4 py-2 border">Сума</th>
                <th className="px-4 py-2 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-4 py-2 border">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border">{expense.description}</td>
                  <td className="px-4 py-2 border">{expense.amount.toFixed(2)} лв</td>
                  <td className="px-4 py-2 border flex space-x-4">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7L5 7M10 11V17M14 11V17M17 7V19C17 20.1046 16.1046 21 15 21H9C7.89543 21 7 20.1046 7 19V7M9 7V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleCopyToCashBook(expense.id)}
                      className="text-green-500 hover:text-green-700 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6M9 16h6M9 20h6M9 4h6M5 8h14M5 12h14M5 16h14M5 20h14"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
