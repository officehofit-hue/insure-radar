export type Currency = "ILS" | "EUR";

export type CategoryId =
  | "flights"
  | "lodging"
  | "transport"
  | "food"
  | "attractions"
  | "insurance"
  | "shopping"
  | "reserve";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  planned: number; // ILS
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  currency: Currency;
  category: CategoryId;
  paidBy: string;
  note: string;
  rate?: number; // שער אירו לשקל שננעל ביום ההוצאה
}

export interface Booking {
  id: string;
  title: string;
  category: CategoryId;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  currency: Currency;
  paid: boolean;
  paidDate?: string; // YYYY-MM-DD, מתי שולם בפועל
  rate?: number; // שער שננעל ביום התשלום. ריק כל עוד לא שולם
  reference: string;
}

export interface ItineraryDay {
  date: string; // YYYY-MM-DD
  city: string;
  plan: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TripState {
  version: 1;
  eurRate: number; // השער הנוכחי לפריטים שעוד לא שולמו
  rateDate?: string;
  rateSource?: "live" | "manual";
  totalBudget: number;
  planned: Record<CategoryId, number>;
  expenses: Expense[];
  bookings: Booking[];
  itinerary: ItineraryDay[];
  checklist: ChecklistItem[];
}
