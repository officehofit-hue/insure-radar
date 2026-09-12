import type { Booking, Category, CategoryId, ChecklistItem, ItineraryDay, TripState } from "./types";

// בסיס הידע של הטיול: נתונים קבועים שלא משתנים מהאפליקציה

export const TRIP = {
  name: "סלובקיה ואוסטריה 2027",
  countries: ["סלובקיה", "אוסטריה"],
  // תאריכי שהייה בפועל: נחיתה בלילה שבין 3 ל-4 באוגוסט, המראה חזרה ב-18
  startDate: "2027-08-04",
  endDate: "2027-08-18",
  homeCurrency: "ILS" as const,
  localCurrency: "EUR" as const,
  defaultEurRate: 4.0, // גיבוי בלבד כשאין שער חי
  defaultTotalBudget: 27000,
};

export const FLIGHTS = [
  {
    direction: "הלוך",
    flightNumber: "W6 2606",
    from: "תל אביב (TLV)",
    to: "ברטיסלבה (BTS)",
    departs: "03/08/2027 22:40",
    arrives: "04/08/2027 01:15",
  },
  {
    direction: "חזור",
    flightNumber: "W6 2605",
    from: "ברטיסלבה (BTS)",
    to: "תל אביב (TLV)",
    departs: "18/08/2027 17:20",
    arrives: "18/08/2027 21:45",
  },
];

export const CATEGORIES: Category[] = [
  { id: "flights", label: "טיסות", icon: "✈️", planned: 5800 },
  { id: "lodging", label: "לינה", icon: "🏨", planned: 8500 },
  { id: "transport", label: "תחבורה", icon: "🚆", planned: 2500 },
  { id: "food", label: "אוכל", icon: "🍽️", planned: 5500 },
  { id: "attractions", label: "אטרקציות", icon: "🎟️", planned: 2200 },
  { id: "insurance", label: "ביטוח נסיעות", icon: "🛡️", planned: 500 },
  { id: "shopping", label: "קניות", icon: "🛍️", planned: 800 },
  { id: "reserve", label: "רזרבה", icon: "🧯", planned: 1200 },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;

export const EMERGENCY = [
  { label: "שגרירות ישראל בווינה", value: "+43 1 476 46 0" },
  { label: "שגרירות ישראל בברטיסלבה", value: "+421 2 5441 4000" },
  { label: "חירום באיחוד האירופי", value: "112" },
];

function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(start + "T00:00:00Z");
  const last = new Date(end + "T00:00:00Z");
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export const TRIP_DAYS = dateRange(TRIP.startDate, TRIP.endDate);

const defaultItinerary: ItineraryDay[] = TRIP_DAYS.map((date, i) => ({
  date,
  city: i === 0 ? "ברטיסלבה" : i === TRIP_DAYS.length - 1 ? "ברטיסלבה" : "",
  plan: i === 0 ? "נחיתה 01:15, מנוחה" : i === TRIP_DAYS.length - 1 ? "טיסה חזרה 17:20" : "",
}));

const defaultBookings: Booking[] = [
  {
    id: "flights",
    title: "טיסות הלוך ושוב W6 2606 / W6 2605",
    category: "flights",
    dueDate: "2027-08-03",
    amount: 1479,
    currency: "EUR",
    paid: true,
    paidDate: "2026-09-07",
    reference: "Wizz Air",
  },
];

const defaultChecklist: ChecklistItem[] = [
  "דרכונים בתוקף 6 חודשים אחרי החזרה",
  "ביטוח נסיעות",
  "כרטיס אשראי ללא עמלת המרה",
  "מזומן באירו לימים הראשונים",
  "חבילת סלולר או eSIM",
  "תרופות ומרשמים",
  "הזמנת לינה לכל הלילות",
  "רישיון נהיגה בינלאומי (אם שוכרים רכב)",
  "ויניטה לכבישים באוסטריה (אם נוסעים ברכב)",
  "צילום מסמכים בענן",
].map((label, i) => ({ id: `chk-${i}`, label, done: false }));

export function defaultState(): TripState {
  return {
    version: 1,
    eurRate: TRIP.defaultEurRate,
    totalBudget: TRIP.defaultTotalBudget,
    planned: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.planned])) as Record<
      CategoryId,
      number
    >,
    expenses: [],
    bookings: defaultBookings,
    itinerary: defaultItinerary,
    checklist: defaultChecklist,
  };
}
