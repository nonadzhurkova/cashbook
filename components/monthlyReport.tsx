import { useState } from "react";
import { fetchEntries } from "../pages/api/firebase-utils"; // Импортирайте вашата функция за четене от Firebase

interface Entry {
  id: string; // Firebase генерира string ID
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}

interface MonthlyReportData {
  entries: Entry[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function MonthlyReport() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [report, setReport] = useState<MonthlyReportData | null>(null);

  const generateMonthlyReport = async () => {
    if (!month || !year) {
      alert("Моля, изберете месец и година!");
      return;
    }

    try {
      const data = await fetchEntries();
    
      const entries = Object.entries(data || {}).map(([id, entry]) => {
        const { id: _, ...rest } = entry as Entry; // Премахваме `id`, ако съществува
        return {
          id, // Уникалният ключ от Firebase
          ...rest, // Останалите свойства
        };
      });
      
      // Филтриране на записите за избрания месец и година
      const filteredEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() + 1 === parseInt(month) &&
          entryDate.getFullYear() === parseInt(year)
        );
      });

      // Изчисляване на приходите, разходите и баланса
      const totalIncome = filteredEntries
        .filter((entry) => entry.type === "приход")
        .reduce((sum, entry) => sum + entry.amount, 0);

      const totalExpense = filteredEntries
        .filter((entry) => entry.type === "разход")
        .reduce((sum, entry) => sum + entry.amount, 0);

      setReport({
        entries: filteredEntries,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Неуспешно генериране на отчет!");
    }
  };

  return (
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
      {report && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-gray-700">
            Отчет за {month}/{year}
          </h3>
          <p>Приходи: {report.totalIncome.toFixed(2)} лв</p>
          <p>Разходи: {report.totalExpense.toFixed(2)} лв</p>
          <p>Салдо: {report.balance.toFixed(2)} лв</p>
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
              {report.entries.map((entry) => (
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
  );
}
