import { useState, useEffect } from "react";
import {
  fetchBookings,
  addBooking,
  updateBookingStatus,
  deleteBooking
} from "../pages/api/firebase-utils";

interface Booking {
  id: string;
  source: "Booking" | "Airbnb" | "Direct";
  description: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [source, setSource] = useState<"Booking" | "Airbnb" | "Direct">("Booking");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBookings();
      const sortedData = Object.entries(data || {})
        .map(([id, booking]) => {
            const { id: _, ...rest } = booking as Booking; // Explicitly typecasting to `Booking`
            return {
            id, // Firebase key
            ...rest, // Remaining fields
            };
        })
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        setBookings(sortedData);

      // Set the page to the closest upcoming booking
      const upcomingIndex = sortedData.findIndex(
        (booking) => new Date(booking.startDate) >= new Date()
      );
      setPage(Math.ceil((upcomingIndex + 1) / itemsPerPage));
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBooking = async () => {
    if (!source || !description || !startDate || !endDate) {
      alert("Моля, попълнете всички полета!");
      return;
    }

    const newBooking = {
      source,
      description,
      startDate,
      endDate,
      completed: false,
    };

    try {
      await addBooking(newBooking);
      setSource("Booking");
      setDescription("");
      setStartDate("");
      setEndDate("");
      loadBookings();
    } catch (error) {
      console.error("Error adding booking:", error);
    }
  };

  const handleToggleCompleted = async (id: string, completed: boolean) => {
    try {
      await updateBookingStatus(id, !completed);
      loadBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBooking(id);
      loadBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Неуспешно изтриване!");
    }
  };


  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">Резервации</h1>

      {/* Form for Adding Bookings */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <select
            className="border border-gray-300 rounded-lg p-2"
            value={source}
            onChange={(e) => setSource(e.target.value as "Booking" | "Airbnb" | "Direct")}
          >
            <option value="Booking">Booking</option>
            <option value="Airbnb">Airbnb</option>
            <option value="Direct">Direct</option>
          </select>
          <input
            type="text"
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          />
          <button
            onClick={handleAddBooking}
            className="bg-indigo-700 text-white py-2 rounded-lg hover:bg-indigo-900 transition"
          >
            Добави резервация
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="text-gray-500 text-center">Зареждане...</p>
        ) : (
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Източник</th>
                <th className="px-4 py-2 border">Описание</th>
                <th className="px-4 py-2 border">От дата</th>
                <th className="px-4 py-2 border">До дата</th>
                <th className="px-4 py-2 border">Изпълнено</th>
                <th className="px-4 py-2 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className={booking.completed ? "bg-gray-100 text-gray-500" : ""}
                >
                  <td className="px-4 py-2 border">{booking.source}</td>
                  <td className="px-4 py-2 border">{booking.description}</td>
                  <td className="px-4 py-2 border">
                    {new Date(booking.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(booking.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={booking.completed}
                      onChange={() => handleToggleCompleted(booking.id, booking.completed)}
                    />
                  </td>
                  <td className="px-4 py-2 border flex space-x-4">
                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-6 h-6"
                      >
                        <path
                          d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 19V6H17V19H7ZM9 8H11V17H9V8ZM13 8H15V17H13V8Z"
                        />
                      </svg>
                    </button>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Предишна
        </button>
        <span>
          Страница {page} от {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Следваща
        </button>
      </div>
    </div>
  );
}
