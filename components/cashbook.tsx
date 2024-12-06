import { useState, useEffect } from "react";
import MonthlyReport from "../components/monthlyReport";

interface Entry {
  id: number;
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}

interface MonthlyReport {
  entries: Entry[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
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

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    const res = await fetch("/api/cash-book");
    const data = await res.json();

    // Sort entries by date in descending order
    const sortedData = data.sort(
      (a: Entry, b: Entry) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setEntries(sortedData);
    setIsLoading(false);
  };

  const addEntry = async () => {
    if (!amount || !description || !date) {
      alert("Моля, попълнете всички полета!");
      return;
    }

    const newEntry = { type, amount: parseFloat(amount), description, date };

    await fetch("/api/cash-book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    });

    setAmount("");
    setDescription("");
   // setDate(""); // Reset to today's date
    await fetchEntries();
  };

  const deleteEntry = async (id: number) => {
    const res = await fetch("/api/cash-book", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      // Update state after deletion
      setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
    } else {
      alert("Неуспешно изтриване!");
    }
  };

  // Pagination logic
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = entries.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(entries.length / itemsPerPage);

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
        Касова книга
      </h1>

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
          onClick={addEntry}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
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
                        ? "bg-green-100" // Light green for income
                        : "bg-red-100" // Light red for expense
                    }
                  >
                    <td className="px-4 py-2 border">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border">{entry.type}</td>
                    <td className="px-4 py-2 border">{entry.amount.toFixed(2)} лв</td>
                    <td className="px-4 py-2 border">{entry.description}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-gray-500 hover:text-red-500 transition"
                      >
                        🗑️
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
                  page === totalPages ? "text-gray-400" : "text-blue-500 hover:bg-blue-100"
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
