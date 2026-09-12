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
}

export interface Booking {
  id: string;
  title: string;
  category: CategoryId;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  currency: Currency;
  paid: boolean;
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
  eurRate: number;
  totalBudget: number;
  planned: Record<CategoryId, number>;
  expenses: Expense[];
  bookings: Booking[];
  itinerary: ItineraryDay[];
  checklist: ChecklistItem[];
}
