import Navbar from "@/components/navbar";
import MonthlyReport from "../components/monthlyReport";

export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
     <Navbar />
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
          Месечни Отчети
        </h1>
        <MonthlyReport />
      </div>
    </div>
  );
}
