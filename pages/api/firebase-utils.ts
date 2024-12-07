import { database, ref,  get, push, remove } from "../../firebase-config";

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


interface Entry {
  date: string;
  type: "приход" | "разход";
  amount: number;
  description: string;
}
