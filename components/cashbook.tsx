import { useState, useEffect } from "react";
import { fetchEntries, addEntry, deleteEntry } from "../pages/api/firebase-utils"; // Firebase utility functions

interface Entry {
  id: string; // Firebase генерира string ID
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}

export default function CashBook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [type, setType] = useState<"приход" | "разход">("приход");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]); // Default to today's date
  const [page, setPage] = useState(1); // Current page
  const [itemsPerPage] = useState(10); // Items per page
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear()); // Default to current year

  useEffect(() => {
    loadEntries();
  }, []);

  // Reset page to 1 when year changes
  useEffect(() => {
    setPage(1);
  }, [selectedYear]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEntries();
      console.log("Fetched data:", data);
  
      if (!data || typeof data !== "object") {
        console.error("Invalid data format:", data);
        setEntries([]);
        return;
      }
  
      const sortedData = Object.entries(data || {})
      .map(([id, entry]) => {
        // Изключваме `id`, ако вече съществува в `entry`
        const { id: _, ...rest } = entry as Entry; // Премахваме `id` от `entry`
        return {
          id, // Уникалният ключ от Firebase
          ...rest, // Останалите полета
        };
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() // Сортиране по дата
      );

    setEntries(sortedData);

    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleAddEntry = async () => {
    if (!amount || !description || !date) {
      alert("Моля, попълнете всички полета!");
      return;
    }

    const newEntry = {
      date,
      type,
      amount: parseFloat(amount),
      description,
    };

    try {
      await addEntry(newEntry);
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      loadEntries();
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id);
      loadEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Неуспешно изтриване!");
    }
  };

  // Filter entries by selected year
  const filteredEntries = entries.filter(entry => {
    const entryYear = new Date(entry.date).getFullYear();
    return entryYear === selectedYear;
  });

  // Pagination logic with filtered entries
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  // Get currency symbol based on year
  const getCurrencySymbol = (year: number) => {
    return year < 2026 ? "лв" : "€";
  };

  // Calculate summary totals for selected year
  const totalIncome = filteredEntries
    .filter(entry => entry.type === "приход")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = filteredEntries
    .filter(entry => entry.type === "разход")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const profit = totalIncome - totalExpenses;

  // Generate year options from entries
  const yearOptions = Array.from(
    new Set(entries.map(entry => new Date(entry.date).getFullYear()))
  ).sort((a, b) => b - a); // Sort descending

  // Add current year if not in entries yet
  if (!yearOptions.includes(new Date().getFullYear())) {
    yearOptions.unshift(new Date().getFullYear());
  }

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">
          Касова книга
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

      {/* Form for Adding Entries */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <select
            className="border border-gray-300 rounded-lg p-2"
            value={type}
            onChange={(e) => setType(e.target.value as "приход" | "разход")}
          >
            <option value="приход">Приход</option>
            <option value="разход">Разход</option>
          </select>
          <input
            type="number"
            placeholder="Сума"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          />
          <input
            type="text"
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          onClick={handleAddEntry}
          className="mt-4 w-full bg-indigo-700 text-white py-2 rounded-lg hover:bg-indigo-900 transition"
        >
          Добави запис
        </button>
      </div>

      {/* Entries Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="text-gray-500 text-center">Зареждане...</p>
        ) : (
          <div>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border">Дата</th>
                  <th className="px-4 py-2 border">Тип</th>
                  <th className="px-4 py-2 border">Сума</th>
                  <th className="px-4 py-2 border">Описание</th>
                  <th className="px-4 py-2 border">Действия</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={
                      entry.type === "приход"
                      ? "bg-indigo-100" // Лек син фон за приходите
                      : "bg-orange-50" // Лек оранжев фон за разходите
                    }
                  >
                    <td className="px-4 py-2 border">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border text-blue-600">{entry.type}</td>
                    <td className="px-4 py-2 border">
                      {entry.amount.toFixed(2)} {getCurrencySymbol(new Date(entry.date).getFullYear())}
                    </td>
                    <td className="px-4 py-2 border">{entry.description}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-6 h-6"
                        >
                          <path
                            d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 19V6H17V19H7ZM9 8H11V17H9V8ZM13 8H15V17H13V8Z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-4">
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 border rounded-lg ${
                  page === 1 ? "text-gray-400" : "text-blue-500 hover:bg-blue-100"
                }`}
              >
                Предишна
              </button>
              <span className="px-4 py-2">
                Страница {page} от {totalPages}
              </span>
              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 border rounded-lg ${
                  page === totalPages
                    ? "text-gray-400"
                    : "text-blue-500 hover:bg-blue-100"
                }`}
              >
                Следваща
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
