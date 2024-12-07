import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-indigo-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Лого */}
        <div className="text-lg font-bold">
          <Link href="/" className="hover:text-blue-200">
            Касова книга
          </Link>
        </div>

        {/* Линкове */}
        <div className="flex space-x-4">
          <Link
            href="/"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Начало
          </Link>
          <Link
            href="/reports"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Отчети
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
