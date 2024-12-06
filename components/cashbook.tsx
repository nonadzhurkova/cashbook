import { useState, useEffect } from "react";

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
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]); // Днешна дата по подразбиране
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    const res = await fetch("/api/cash-book");
    const data = await res.json();
    setEntries(data);
    setIsLoading(false);
  };

  const addEntry = async () => {
    if (!amount || !description) {
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
    setDate(new Date().toISOString().split("T")[0]); // Връщане на датата към днешната
    await fetchEntries();
  };

  const generateMonthlyReport = async () => {
    if (!month || !year) {
      alert("Моля, изберете месец и година!");
      return;
    }

    const res = await fetch(`/api/cash-book?month=${month}&year=${year}`);
    const data = await res.json();
    setMonthlyReport(data);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
        Касова книга
      </h1>

      {/* Форма за добавяне на записи */}
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

      {/* Таблица със записи */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="text-gray-500 text-center">Зареждане...</p>
        ) : (
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Дата</th>
                <th className="px-4 py-2 border">Тип</th>
                <th className="px-4 py-2 border">Сума</th>
                <th className="px-4 py-2 border">Описание</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-2 border">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">{entry.type}</td>
                  <td className="px-4 py-2 border">{entry.amount.toFixed(2)} лв</td>
                  <td className="px-4 py-2 border">{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Месечен отчет */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Месечен отчет</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            className="border border-gray-300 rounded-lg p-2"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Месец</option>
            {[...Array(12).keys()].map((m) => (
              <option key={m + 1} value={m + 1}>
                {m + 1}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Година"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          />
          <button
            onClick={generateMonthlyReport}
            className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Генерирай отчет
          </button>
        </div>
        {monthlyReport && (
          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-700">
              Отчет за {month}/{year}
            </h3>
            <p>Приходи: {monthlyReport.totalIncome.toFixed(2)} лв</p>
            <p>Разходи: {monthlyReport.totalExpense.toFixed(2)} лв</p>
            <p>Салдо: {monthlyReport.balance.toFixed(2)} лв</p>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg mt-4">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border">Дата</th>
                  <th className="px-4 py-2 border">Тип</th>
                  <th className="px-4 py-2 border">Сума</th>
                  <th className="px-4 py-2 border">Описание</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport.entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2 border">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border">{entry.type}</td>
                    <td className="px-4 py-2 border">{entry.amount.toFixed(2)} лв</td>
                    <td className="px-4 py-2 border">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
