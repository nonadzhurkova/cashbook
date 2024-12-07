export default function Footer() {
    return (
      <footer className="bg-indigo-900 text-white mt-6">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            {/* Лявата част */}
            <p className="text-sm">&copy; {new Date().getFullYear()} Касова книга. Всички права запазени.</p>
  
            {/* Дясната част */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="hover:text-blue-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Политика за поверителност
              </a>
              <a
                href="#"
                className="hover:text-blue-300 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Контакти
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  