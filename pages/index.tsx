import { useEffect } from "react";
import { useRouter } from "next/router";
import CashBook from "../components/cashbook";
import Link from "next/link";
import Navbar from "../components/navbar";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("loggedIn");
    if (!isLoggedIn) {
      router.push("/login"); // Redirect to login if not logged in
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Menu */}
      <Navbar />

      {/* Content */}
      <CashBook />
    </div>
  );
}
