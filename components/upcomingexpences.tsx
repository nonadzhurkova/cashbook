import { useState, useEffect } from "react";
import {
  fetchUpcomingEntries,
  fetchUpcomingExpense,
  addUpcomingEntry,
  deleteUpcomingEntry,
  copyToCashBook,
  updateUpcomingEntry
} from "../pages/api/firebase-utils";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "Яна" | "Others";
}

export default function UpcomingExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"Яна" | "Others">("Яна");
  const [filter, setFilter] = useState<"All" | "Яна" | "Others">("All");
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [tempEdit, setTempEdit] = useState<Partial<Expense>>({});

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [expenses, filter]);

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


  const applyFilter = () => {
    if (filter === "All") {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(expenses.filter((expense) => expense.type === filter));
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !description || !date || !type) {
      alert("Моля, попълнете всички полета!");
      return;
    }

    const newExpense = {
      date,
      description,
      amount: parseFloat(amount),
      type,
    };

    try {
      await addUpcomingEntry(newExpense);
      setAmount("");
      setDescription("");
      setType("Яна");
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

  const handleEditStart = (id: string, expense: Expense) => {
    setEditMode(id);
    setTempEdit({ ...expense }); // Store current values in tempEdit
  };

  const handleEditSave = async () => {
    try {
      const updatedExpense = tempEdit;
      if (!editMode || !updatedExpense) return;

      // Update in Firebase (if needed)
      await updateUpcomingEntry(editMode, updatedExpense);

      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === editMode ? { ...expense, ...updatedExpense } : expense
        )
      );
      setEditMode(null);
      setTempEdit({});
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Грешка при записване на промените!");
    }
  };

  // Get currency symbol based on year
  const getCurrencySymbol = (year: number) => {
    return year < 2026 ? "лв" : "€";
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
        Предстоящи разходи
      </h1>

      {/* Form for Adding Expenses */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "Яна" | "Others")}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value="Яна">Яна</option>
            <option value="Others">Others</option>
          </select>
        </div>
        <button
          onClick={handleAddExpense}
          className="mt-4 w-full bg-indigo-700 text-white py-2 rounded-lg hover:bg-indigo-900 transition"
        >
          Добави разход
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "All" | "Яна" | "Others")}
          className="border border-gray-300 rounded-lg p-2"
        >
          <option value="All">Всички</option>
          <option value="Яна">Яна</option>
          <option value="Others">Others</option>
        </select>
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
                <th className="px-4 py-2 border">Тип</th>
                <th className="px-4 py-2 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-4 py-2 border">
                    {editMode === expense.id ? (
                      <input
                        type="date"
                        value={tempEdit.date || expense.date}
                        onChange={(e) =>
                          setTempEdit((prev) => ({ ...prev, date: e.target.value }))
                        }
                      />
                    ) : (
                      new Date(expense.date).toLocaleDateString()
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editMode === expense.id ? (
                      <input
                        type="text"
                        value={tempEdit.description || expense.description}
                        onChange={(e) =>
                          setTempEdit((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      expense.description
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editMode === expense.id ? (
                      <input
                        type="number"
                        value={tempEdit.amount || expense.amount}
                        onChange={(e) =>
                          setTempEdit((prev) => ({
                            ...prev,
                            amount: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    ) : (
                      `${expense.amount.toFixed(2)} ${getCurrencySymbol(new Date(expense.date).getFullYear())}`
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editMode === expense.id ? (
                      <select
                        value={tempEdit.type || expense.type}
                        onChange={(e) =>
                          setTempEdit((prev) => ({
                            ...prev,
                            type: e.target.value as "Яна" | "Others",
                          }))
                        }
                        className="border border-gray-300 rounded-lg p-2"
                      >
                        <option value="Яна">Яна</option>
                        <option value="Others">Others</option>
                      </select>
                    ) : (
                      expense.type
                    )}
                  </td>
                  <td className="px-4 py-2 border flex space-x-4">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => handleCopyToCashBook(expense.id)}
                      className="text-green-500 hover:text-green-700 focus:outline-none"
                    >
                      📋
                    </button>
                    {editMode === expense.id ? (
                      <button
                        onClick={handleEditSave}
                        className="text-indigo-500 hover:text-indigo-700 focus:outline-none"
                      >
                        Съхрани
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditStart(expense.id, expense)}
                        className="text-yellow-500 hover:text-yellow-700 focus:outline-none"
                      >
                        ✏️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-2 border" colSpan={2}>Общо:</td>
                <td className="px-4 py-2 border">
                  {(() => {
                    const levTotal = filteredExpenses
                      .filter(expense => new Date(expense.date).getFullYear() < 2026)
                      .reduce((sum, expense) => sum + expense.amount, 0);

                    const euroTotal = filteredExpenses
                      .filter(expense => new Date(expense.date).getFullYear() >= 2026)
                      .reduce((sum, expense) => sum + expense.amount, 0);

                    const parts = [];
                    if (levTotal > 0) parts.push(`${levTotal.toFixed(2)} лв`);
                    if (euroTotal > 0) parts.push(`${euroTotal.toFixed(2)} €`);

                    return parts.join(' + ') || '0.00 лв';
                  })()}
                </td>
                <td className="px-4 py-2 border" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
