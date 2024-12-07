import Navbar from "./navbar";
import Footer from "./footer";

export default function Layout({ children }: { children: React.ReactNode }) {
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
