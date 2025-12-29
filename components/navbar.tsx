import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-indigo-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="text-lg font-bold">
          <Link href="/" className="hover:text-blue-200">
            Касова книга
          </Link>
        </div>

        {/* Hamburger Menu Icon */}
        <div className="sm:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus:outline-none text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="hidden sm:flex space-x-4">
          <Link
            href="/"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Начало
          </Link>
          <Link
            href="/cashbook"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Касова книга
          </Link>
          <Link
            href="/reports"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Отчети
          </Link>
          <Link
            href="/bookings"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Резервации
          </Link>
          <Link
            href="/upcoming-expenses"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Предстоящи Разходи
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-indigo-800">
          <div className="space-y-2 px-4 py-2">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Начало
            </Link>
            <Link
              href="/cashbook"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Касова книга
            </Link>
            <Link
              href="/reports"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Отчети
            </Link>
            <Link
              href="/bookings"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Резервации
            </Link>
            <Link
              href="/upcoming-expenses"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Предстоящи Разходи
            </Link>
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
