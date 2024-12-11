import { database, ref,  get, push, remove, update } from "../../firebase-config";

// Четене на записи
export async function fetchEntries() {
  const dbRef = ref(database, "cash-book");
  const snapshot = await get(dbRef);
  return snapshot.val();
}

// Добавяне на нов запис
export async function addEntry(entry: Entry) {
  const dbRef = ref(database, "cash-book");
  await push(dbRef, entry);
}

// Изтриване на запис
export async function deleteEntry(id: string) {
  const entryRef = ref(database, `cash-book/${id}`);
  await remove(entryRef);
}

// Четене на записи за предстоящи разходи
export async function fetchUpcomingEntries() {
  const dbRef = ref(database, "upcoming-expenses"); // Указваме "upcoming-expenses"
  const snapshot = await get(dbRef);
  return snapshot.val();
}

// Четене на конкретен запис от upcoming-expenses по ID
export async function fetchUpcomingExpense(id: string) {
  const expenseRef = ref(database, `upcoming-expenses/${id}`);
  const snapshot = await get(expenseRef);
  return snapshot.exists() ? snapshot.val() : null; // Връщаме данните или null, ако не съществуват
}


// Добавяне на нов запис за предстоящи разходи
export async function addUpcomingEntry(entry: { date: string; description: string; amount: number ; type: string }) {
  const dbRef = ref(database, "upcoming-expenses");
  await push(dbRef, entry); // Използваме push за добавяне на нов запис
}

// Изтриване на запис за предстоящи разходи
export async function deleteUpcomingEntry(id: string) {
  const entryRef = ref(database, `upcoming-expenses/${id}`); // Специфицираме конкретния запис чрез ID
  await remove(entryRef); // Изтриваме записа
}

export async function updateUpcomingEntry(id: string, updatedData: Partial<Expense>) {
  const entryRef = ref(database, `upcoming-expenses/${id}`);
  await update(entryRef, updatedData);
}
// Копиране на запис в cash-book
export async function copyToCashBook(entry: Entry) {
  const cashBookRef = ref(database, "cash-book");
  await push(cashBookRef, entry);
}

interface Entry {
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}
interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "Яна" | "Others";
}

// Fetch all bookings
export async function fetchBookings() {
  const dbRef = ref(database, "bookings");
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return {};
  }
}

// Add a new booking
export async function addBooking(booking: {
  source: "Booking" | "Airbnb" | "Direct";
  description: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}) {
  const dbRef = ref(database, "bookings");
  await push(dbRef, booking);
}

// Update booking status (completed or not)
export async function updateBookingStatus(id: string, completed: boolean) {
  const bookingRef = ref(database, `bookings/${id}`);
  await update(bookingRef, { completed });
}

// Delete a booking
export async function deleteBooking(id: string) {
  const bookingRef = ref(database, `bookings/${id}`);
  await remove(bookingRef);
}