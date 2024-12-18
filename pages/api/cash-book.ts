import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

const filePath = path.join(process.cwd(), "public", "data", "cash-book.json");

interface Entry {
  id: number;
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}

function loadData(): Entry[] {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const fileData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileData) as Entry[];
}

function saveData(data: Entry[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    const { month, year, summary } = req.query;

    const data = loadData();

    if (summary === "yearly") {
      const currentYear = new Date().getFullYear();
      const monthlySummary = Array(12).fill(null).map(() => ({
        income: 0,
        expense: 0,
      }));

      data.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate.getFullYear() === currentYear) {
          const monthIndex = entryDate.getMonth(); // 0 = January, 1 = February, etc.
          if (entry.type === "приход") {
            monthlySummary[monthIndex].income += entry.amount;
          } else if (entry.type === "разход") {
            monthlySummary[monthIndex].expense += entry.amount;
          }
        }
      });

      return res.status(200).json(monthlySummary);
    }

    if (month && year) {
      const filteredData = data.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getMonth() + 1 === parseInt(month as string) &&
          entryDate.getFullYear() === parseInt(year as string)
        );
      });

      const totalIncome = filteredData
        .filter((entry) => entry.type === "приход")
        .reduce((sum, entry) => sum + entry.amount, 0);

      const totalExpense = filteredData
        .filter((entry) => entry.type === "разход")
        .reduce((sum, entry) => sum + entry.amount, 0);

      return res.status(200).json({
        entries: filteredData,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      });
    }

    res.status(200).json(data);
  } else if (method === "POST") {
    const { type, amount, description, date } = req.body;

    if (!type || !amount || !description || !date) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const data = loadData();

    const newEntry: Entry = {
      id: Date.now(),
      date,
      type: type as "приход" | "разход",
      amount: parseFloat(amount),
      description,
    };

    data.push(newEntry);
    saveData(data);

    res.status(201).json(newEntry);
  } else if (method === "DELETE") {
    const { id } = req.body;

    const data = loadData();
    const filteredData = data.filter((entry) => entry.id !== id);

    saveData(filteredData);

    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
