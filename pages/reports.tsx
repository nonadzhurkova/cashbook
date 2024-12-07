import MonthlyReport from "../components/monthlyReport";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Reports() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("loggedIn");
    if (!isLoggedIn) {
      router.push("/login"); // Redirect to login if not logged in
    }
  }, [router])
  
  return (
    <div>
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
          Месечни Отчети
        </h1>
        <MonthlyReport />
      </div>
    </div>
  );
}
