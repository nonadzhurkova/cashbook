import { useState, useEffect } from "react";
import { fetchEntries } from "../lib/firebase-utils";

interface Entry {
  id: string;
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}


interface CategoryTotal {
  category: string;
  amount: number;
  percentage: number;
}

interface ExpenseStatisticsProps {
  selectedYear?: number;
}

export default function ExpenseStatistics({ selectedYear }: ExpenseStatisticsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [topCategories, setTopCategories] = useState<CategoryTotal[]>([]);
  const currentYear = selectedYear || new Date().getFullYear();

  useEffect(() => {
    loadExpenseData();
  }, [currentYear]);

  const loadExpenseData = async () => {
    setIsLoading(true);
    try {
      const data: Record<string, Entry> = await fetchEntries();
      const entries = Object.values(data);

      // Filter expenses for selected year
      const yearExpenses = entries.filter(entry =>
        entry.type === "разход" && new Date(entry.date).getFullYear() === currentYear
      );

      // Calculate top categories for the year
      const categoryTotals: Record<string, number> = {};
      yearExpenses.forEach(entry => {
        const category = categorizeExpense(entry.description);
        categoryTotals[category] = (categoryTotals[category] || 0) + entry.amount;
      });

      const totalYearExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
      const topCategoriesArray: CategoryTotal[] = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalYearExpenses > 0 ? (amount / totalYearExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8); // Top 8 categories

      setTopCategories(topCategoriesArray);

    } catch (error) {
      console.error("Error loading expense data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Categorize expenses based on description keywords
  const categorizeExpense = (description: string): string => {
    const desc = description.toLowerCase();

    // Specific categories requested by user
    if (desc.includes('евн')) {
      return 'ЕВН';
    }
    if (desc.includes('ддс') || desc.includes('dds')) {
      return 'ДДС';
    }
    if (desc.includes('яна')) {
      return 'Яна';
    }

    // Bulgarian keywords for categories
    if (desc.includes('патент') || desc.includes('лиценз') || desc.includes('такса')) {
      return 'Такси и лицензи';
    }
    if (desc.includes('счетовод') || desc.includes('данък') || desc.includes('данъч')) {
      return 'Счетоводство';
    }
    if (desc.includes('козметик') || desc.includes('крем') || desc.includes('грим') || desc.includes('парфюм')) {
      return 'Козметика';
    }
    if (desc.includes('храна') || desc.includes('supermarket') || desc.includes('магазин') || desc.includes('abc') || desc.includes('dm')) {
      return 'Храна и домакинство';
    }
    if (desc.includes('транспорт') || desc.includes('бензин') || desc.includes('паркинг') || desc.includes('такси')) {
      return 'Транспорт';
    }
    if (desc.includes('комунал') || desc.includes('ток') || desc.includes('вода') || desc.includes('интернет') || desc.includes('телефон')) {
      return 'Комунални услуги';
    }
    if (desc.includes('ремонт') || desc.includes('поддръжка') || desc.includes('строител')) {
      return 'Ремонт и поддръжка';
    }
    if (desc.includes('медицин') || desc.includes('лекар') || desc.includes('аптек')) {
      return 'Здравеопазване';
    }
    if (desc.includes('застраховк')) {
      return 'Застраховки';
    }
    if (desc.includes('облекло') || desc.includes('дрехи') || desc.includes('обуща')) {
      return 'Облекло';
    }
    if (desc.includes('развлечени') || desc.includes('ресторант') || desc.includes('кафе') || desc.includes('бар')) {
      return 'Развлечения';
    }
    if (desc.includes('образовани') || desc.includes('курс') || desc.includes('книга')) {
      return 'Образование';
    }

    // Default category for uncategorized expenses
    return 'Други разходи';
  };

  const getCurrencySymbol = (year: number) => {
    return year < 2026 ? "лв" : "€";
  };


  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Анализ на разходите</h2>

      {isLoading ? (
        <p className="text-gray-500 text-center">Зареждане...</p>
      ) : (
        <div className="space-y-6">
          {/* Top Categories for the Year */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Основни категории разходи за {currentYear}
            </h3>
            {topCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topCategories.map((category, index) => (
                  <div key={category.category} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{category.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        index === 0 ? 'bg-red-100 text-red-700' :
                        index === 1 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {category.amount.toFixed(2)} {getCurrencySymbol(currentYear)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {category.percentage.toFixed(1)}% от общите разходи
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Няма данни за разходи за тази година</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
