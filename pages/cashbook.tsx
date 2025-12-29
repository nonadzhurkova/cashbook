import { useEffect } from "react";
import { useRouter } from "next/router";
import CashBook from "../components/cashbook";

export default function CashBookPage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("loggedIn");
    if (!isLoggedIn) {
      router.push("/login"); // Redirect to login if not logged in
    }
  }, [router])

  return (
    <div>
      <CashBook />
    </div>
  );
}
