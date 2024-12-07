import Navbar from "./navbar";
import Footer from "./footer";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Layout({ children }: { children: React.ReactNode }) {

    const router = useRouter();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("loggedIn");
    if (!isLoggedIn) {
      router.push("/login"); // Redirect to login if not logged in
    }
  }, [router])

  return (
    <div className="flex flex-col min-h-screen  bg-slate-200">
      {/* Навигация */}
      <Navbar />

      {/* Основно съдържание */}
      <main className="flex-grow p-6">{children}</main>

      {/* Футър */}
      <Footer />
    </div>
  );
}
