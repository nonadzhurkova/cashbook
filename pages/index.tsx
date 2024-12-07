import { useEffect } from "react";
import { useRouter } from "next/router";
import CashBook from "../components/cashbook";
import Navbar from "../components/navbar";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("loggedIn");
    if (!isLoggedIn) {
      router.push("/login"); // Redirect to login if not logged in
    }
  }, [router])

  return (
    <div >
    

      {/* Content */}
      <CashBook />
    </div>
  );
}
