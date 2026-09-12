import { defaultState } from "./data";
import type { TripState } from "./types";

const KEY = "insure-radar-trip-2027";

// שכבת השמירה מופרדת בכוונה: כרגע localStorage, בהמשך אפשר להחליף ל-Google Sheet

export function loadState(): TripState {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<TripState>;
    return {
      ...base,
      ...saved,
      planned: { ...base.planned, ...(saved.planned ?? {}) },
      itinerary: mergeItinerary(base, saved),
      checklist: saved.checklist?.length ? saved.checklist : base.checklist,
      bookings: migrateBookings(base, saved),
      expenses: saved.expenses ?? [],
    };
  } catch {
    return base;
  }
}

function migrateBookings(base: TripState, saved: Partial<TripState>) {
  if (!saved.bookings) return base.bookings;
  // גרסה קודמת שמרה שתי טיסות עם סכום 0 לעדכון: מחליפים ברשומה האמיתית
  const placeholders = saved.bookings.filter((b) => b.id === "flight-out" || b.id === "flight-back");
  if (placeholders.length && placeholders.every((b) => b.amount === 0)) {
    const rest = saved.bookings.filter((b) => b.id !== "flight-out" && b.id !== "flight-back");
    return [...base.bookings, ...rest];
  }
  // רשומת הטיסות מגרסה קודמת בלי שער נעול מקבלת את השער מהחיוב בפועל
  return saved.bookings.map((b) =>
    b.id === "flights" && !b.rate ? { ...b, rate: base.bookings[0].rate, amount: base.bookings[0].amount } : b,
  );
}

function mergeItinerary(base: TripState, saved: Partial<TripState>) {
  const savedByDate = new Map((saved.itinerary ?? []).map((d) => [d.date, d]));
  return base.itinerary.map((d) => savedByDate.get(d.date) ?? d);
}

export function saveState(state: TripState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // אין מקום או מצב פרטי: ממשיכים בלי שמירה
  }
}

export function exportState(state: TripState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trip-budget-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImported(text: string): TripState | null {
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.version === 1 && Array.isArray(parsed.expenses)) {
      return { ...defaultState(), ...parsed };
    }
  } catch {
    // קובץ לא תקין
  }
  return null;
}
