import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 mb-6">
      <div className="max-w-4xl mx-auto flex justify-between">
        <Link href="/" className="text-blue-500 font-semibold hover:underline">
          Касова книга
        </Link>
        <Link href="/reports" className="text-blue-500 font-semibold hover:underline">
          Отчети
        </Link>
        <Link href="/dashboard" className="text-blue-500 font-semibold hover:underline">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
