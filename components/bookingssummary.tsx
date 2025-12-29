import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchBookings } from "../lib/firebase-utils";

interface Booking {
  id: string;
  source: "Booking" | "Airbnb" | "Direct";
  description: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}

export default function BookingsSummary() {
  const [bookings, setBookings] = useState<Booking[]>([]);
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
            const { id: _, ...rest } = booking as Booking;
            return {
            id,
            ...rest,
            };
        })
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      // Show current/upcoming bookings (next 5)
      const upcomingBookings = sortedData.filter(booking => !booking.completed);
      setBookings(upcomingBookings.slice(0, 5));
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate number of nights for each booking
  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const currentBookings = bookings.filter(booking =>
    new Date(booking.startDate) <= new Date() && new Date(booking.endDate) >= new Date()
  );

  const upcomingBookings = bookings.filter(booking =>
    new Date(booking.startDate) > new Date()
  );

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">Резервации</h2>
        <Link
          href="/bookings"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Виж всички →
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-center">Зареждане...</p>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {/* Current Bookings */}
          {currentBookings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">ТЕКУЩИ</h3>
              <div className="space-y-2">
                {currentBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{booking.description}</div>
                      <div className="text-sm text-gray-600">
                        {booking.source} • {calculateNights(booking.startDate, booking.endDate)} нощувки
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.startDate).toLocaleDateString('bg-BG')} - {new Date(booking.endDate).toLocaleDateString('bg-BG')}
                      </div>
                    </div>
                    <div className="text-green-600 font-medium">АКТИВНА</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">ПРЕДСТОЯЩИ</h3>
              <div className="space-y-2">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{booking.description}</div>
                      <div className="text-sm text-gray-600">
                        {booking.source} • {calculateNights(booking.startDate, booking.endDate)} нощувки
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(booking.startDate).toLocaleDateString('bg-BG')} - {new Date(booking.endDate).toLocaleDateString('bg-BG')}
                      </div>
                    </div>
                    <div className="text-gray-600 font-medium">ОЧАКВА СЕ</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="border-t pt-3 mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Общо резервации:</span>
              <span className="font-semibold">{bookings.length}</span>
            </div>
            {currentBookings.length > 0 && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-green-600">Текущи:</span>
                <span className="font-semibold text-green-600">{currentBookings.length}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">Няма предстоящи резервации</p>
          <Link
            href="/bookings"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Добави резервация →
          </Link>
        </div>
      )}
    </div>
  );
}
