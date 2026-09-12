"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_MAP, EMERGENCY, FLIGHTS, TRIP, TRIP_DAYS } from "./data";
import { exportState, loadState, parseImported, saveState } from "./storage";
import type { Booking, CategoryId, Currency, Expense, TripState } from "./types";

const ils = (n: number) =>
  n.toLocaleString("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 });
const eur = (n: number) =>
  n.toLocaleString("he-IL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
const weekday = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("he-IL", { weekday: "short" });
const todayIso = () => new Date().toISOString().slice(0, 10);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

async function fetchRate(date?: string): Promise<{ rate: number; date: string } | null> {
  try {
    const res = await fetch(`/api/eur-rate${date ? `?date=${date}` : ""}`);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.rate === "number" ? { rate: data.rate, date: data.date } : null;
  } catch {
    return null;
  }
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground";
const cardCls = "bg-card-bg border border-card-border rounded-2xl p-5";
const btnCls =
  "px-4 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-medium hover:opacity-90 transition-opacity";
const btnGhost =
  "px-3 py-2 rounded-xl border border-card-border text-sm text-text-muted hover:text-accent hover:border-accent transition-colors";

function Section({ id, title, children, action }: { id: string; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Bar({ ratio, danger }: { ratio: number; danger?: boolean }) {
  const pct = Math.min(100, Math.max(0, ratio * 100));
  return (
    <div className="h-2 rounded-full bg-section-bg overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${danger ? "bg-accent-red" : ratio > 0.85 ? "bg-accent" : "bg-accent-green"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function TripDashboard() {
  const [state, setState] = useState<TripState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const update = (patch: Partial<TripState> | ((s: TripState) => TripState)) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      saveState(next);
      return next;
    });
  };

  const toIls = (amount: number, currency: Currency, rate?: number) =>
    currency === "EUR" ? amount * (rate ?? state?.eurRate ?? TRIP.defaultEurRate) : amount;

  // שער חי: נטען פעם אחת, ופריטים ששולמו בלי שער נעול מקבלים את השער של יום התשלום
  useEffect(() => {
    if (!state) return;
    let cancelled = false;
    (async () => {
      const live = await fetchRate();
      if (cancelled) return;
      if (live) update({ eurRate: live.rate, rateDate: live.date, rateSource: "live" });

      const missingBookings = state.bookings.filter((b) => b.paid && b.currency === "EUR" && !b.rate);
      const missingExpenses = state.expenses.filter((e) => e.currency === "EUR" && !e.rate);
      if (!missingBookings.length && !missingExpenses.length) return;
      const dates = new Set<string>([
        ...missingBookings.map((b) => b.paidDate ?? todayIso()),
        ...missingExpenses.map((e) => e.date),
      ]);
      const rates = new Map<string, number>();
      for (const d of dates) {
        const r = await fetchRate(d);
        if (r) rates.set(d, r.rate);
      }
      if (cancelled || !rates.size) return;
      update((s) => ({
        ...s,
        bookings: s.bookings.map((b) => {
          const key = b.paidDate ?? todayIso();
          return b.paid && b.currency === "EUR" && !b.rate && rates.has(key) ? { ...b, rate: rates.get(key) } : b;
        }),
        expenses: s.expenses.map((e) =>
          e.currency === "EUR" && !e.rate && rates.has(e.date) ? { ...e, rate: rates.get(e.date) } : e,
        ),
      }));
    })();
    return () => { cancelled = true; };
  }, [state !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    if (!state) return null;
    const today = todayIso();
    const spentByCat = {} as Record<CategoryId, number>;
    CATEGORIES.forEach((c) => (spentByCat[c.id] = 0));
    for (const e of state.expenses) spentByCat[e.category] += toIls(e.amount, e.currency, e.rate);
    for (const b of state.bookings) if (b.paid) spentByCat[b.category] += toIls(b.amount, b.currency, b.rate);
    const spent = Object.values(spentByCat).reduce((a, b) => a + b, 0);
    const committed = state.bookings
      .filter((b) => !b.paid)
      .reduce((a, b) => a + toIls(b.amount, b.currency), 0);
    const plannedTotal = Object.values(state.planned).reduce((a, b) => a + b, 0);
    const remaining = state.totalBudget - spent - committed;

    const totalDays = TRIP_DAYS.length;
    const phase = today < TRIP.startDate ? "before" : today > TRIP.endDate ? "after" : "during";
    const dayIndex = TRIP_DAYS.indexOf(today);
    const daysElapsed = phase === "before" ? 0 : phase === "after" ? totalDays : dayIndex + 1;
    const daysLeft = totalDays - daysElapsed;
    const daysUntil = Math.max(
      0,
      Math.round((new Date(TRIP.startDate).getTime() - new Date(today).getTime()) / 86400000),
    );

    // הוצאות בשטח: מה שלא טיסות, לינה וביטוח, כדי לחשב קצב יומי
    const onTripCats: CategoryId[] = ["transport", "food", "attractions", "shopping", "reserve"];
    const onTripPlanned = onTripCats.reduce((a, c) => a + state.planned[c], 0);
    const onTripSpent = state.expenses
      .filter((e) => onTripCats.includes(e.category) && e.date >= TRIP.startDate)
      .reduce((a, e) => a + toIls(e.amount, e.currency, e.rate), 0);
    const dailyBudget = onTripPlanned / totalDays;
    const dailyAvg = daysElapsed > 0 ? onTripSpent / daysElapsed : 0;
    const dailyRemaining = daysLeft > 0 ? (onTripPlanned - onTripSpent) / daysLeft : 0;

    return {
      spent, committed, remaining, plannedTotal, spentByCat,
      phase, daysElapsed, daysLeft, daysUntil, totalDays,
      dailyBudget, dailyAvg, dailyRemaining, onTripSpent, onTripPlanned,
    };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state || !stats) {
    return <div className="max-w-6xl mx-auto px-5 py-10 text-text-muted text-sm">טוען...</div>;
  }

  const budgetRatio = stats.spent / state.totalBudget;
  const timeRatio = stats.daysElapsed / stats.totalDays;
  const overPace = stats.phase === "during" && budgetRatio > timeRatio + 0.05;

  const nav = [
    ["budget", "תקציב"], ["expenses", "הוצאות"], ["itinerary", "מסלול"],
    ["bookings", "הזמנות"], ["checklist", "צ'קליסט"], ["info", "מידע"],
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#faf8f4]/95 backdrop-blur-lg border-b border-card-border">
        <div className="max-w-6xl mx-auto px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-blue to-[#2a4a7a] flex items-center justify-center text-lg text-white shadow-lg shadow-accent-blue/20">
              ✈️
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight gold-gradient">{TRIP.name}</h1>
              <p className="text-[11px] text-text-muted">
                {fmtDate(TRIP.startDate)} עד {fmtDate(TRIP.endDate)} · {stats.totalDays} ימים
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-0.5 overflow-x-auto -mx-1">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="px-2.5 py-1.5 rounded-lg text-[13px] text-text-muted hover:text-accent whitespace-nowrap">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-12">
        {/* תקציב ראשי */}
        <Section id="budget" title="תקציב">
          <div className={`${cardCls} space-y-4`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs text-text-muted">הוצא עד כה</p>
                <p className="text-3xl font-bold">{ils(stats.spent)}</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-text-muted">מתוך תקציב</p>
                <p className="text-xl font-bold text-text-muted">{ils(state.totalBudget)}</p>
              </div>
            </div>
            <Bar ratio={budgetRatio} danger={overPace || budgetRatio > 1} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Stat label="נשאר פנוי" value={ils(stats.remaining)} tone={stats.remaining < 0 ? "red" : "green"} />
              <Stat label="מחויב ולא שולם" value={ils(stats.committed)} />
              <Stat label="ניצול תקציב" value={`${Math.round(budgetRatio * 100)}%`} tone={overPace ? "red" : undefined} />
              <Stat
                label={stats.phase === "before" ? "ימים עד הטיול" : stats.phase === "after" ? "הטיול הסתיים" : "ימים שעברו"}
                value={stats.phase === "before" ? `${stats.daysUntil}` : stats.phase === "after" ? "✔" : `${stats.daysElapsed} / ${stats.totalDays}`}
              />
            </div>
            {overPace && (
              <p className="text-xs text-accent-red bg-accent-red/5 rounded-xl px-3 py-2">
                הקצב גבוה מהמתוכנן: {Math.round(budgetRatio * 100)}% מהתקציב מול {Math.round(timeRatio * 100)}% מהימים.
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className={cardCls}>
              <p className="text-xs text-text-muted mb-1">תקציב יומי בשטח</p>
              <p className="text-2xl font-bold">{ils(stats.dailyBudget)}</p>
              <p className="text-[11px] text-text-muted mt-1">{eur(stats.dailyBudget / state.eurRate)} · תחבורה, אוכל, אטרקציות, קניות</p>
            </div>
            <div className={cardCls}>
              <p className="text-xs text-text-muted mb-1">ממוצע יומי בפועל</p>
              <p className={`text-2xl font-bold ${stats.dailyAvg > stats.dailyBudget ? "text-accent-red" : ""}`}>
                {stats.daysElapsed > 0 ? ils(stats.dailyAvg) : "עדיין אין"}
              </p>
              <p className="text-[11px] text-text-muted mt-1">מתוך {ils(stats.onTripSpent)} שהוצאו בשטח</p>
            </div>
            <div className={cardCls}>
              <p className="text-xs text-text-muted mb-1">מותר ליום לימים שנשארו</p>
              <p className="text-2xl font-bold">{stats.daysLeft > 0 ? ils(stats.dailyRemaining) : "0"}</p>
              <p className="text-[11px] text-text-muted mt-1">{stats.daysLeft} ימים נשארו</p>
            </div>
          </div>

          <div className={`${cardCls} space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">לפי קטגוריה</h3>
              <span className={`text-xs ${stats.plannedTotal !== state.totalBudget ? "text-accent-red" : "text-text-muted"}`}>
                סכום המתוכנן: {ils(stats.plannedTotal)}
              </span>
            </div>
            {CATEGORIES.map((c) => {
              const spent = stats.spentByCat[c.id];
              const planned = state.planned[c.id];
              return (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span>{c.icon} {c.label}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={spent > planned ? "text-accent-red font-bold" : ""}>{ils(spent)}</span>
                      <span className="text-text-muted">/</span>
                      <input
                        type="number"
                        value={planned}
                        onChange={(e) => update({ planned: { ...state.planned, [c.id]: Number(e.target.value) || 0 } })}
                        className="w-20 px-2 py-1 rounded-lg bg-section-bg border border-card-border text-xs text-left"
                      />
                    </div>
                  </div>
                  <Bar ratio={planned ? spent / planned : 0} danger={spent > planned} />
                </div>
              );
            })}
          </div>

          <div className={`${cardCls} grid grid-cols-2 md:grid-cols-4 gap-3 items-end`}>
            <label className="text-xs text-text-muted">
              תקציב כולל (₪)
              <input type="number" value={state.totalBudget} onChange={(e) => update({ totalBudget: Number(e.target.value) || 0 })} className={`${inputCls} mt-1`} />
            </label>
            <label className="text-xs text-text-muted">
              שער אירו נוכחי (₪){" "}
              {state.rateSource === "live" ? (
                <span className="text-accent-green">חי · {state.rateDate ? fmtDate(state.rateDate) : ""}</span>
              ) : (
                <span className="text-accent-red">ידני</span>
              )}
              <input type="number" step="0.01" value={state.eurRate} onChange={(e) => update({ eurRate: Number(e.target.value) || 1, rateSource: "manual" })} className={`${inputCls} mt-1`} />
            </label>
            <button className={btnGhost} onClick={() => exportState(state)}>⬇️ ייצוא לקובץ</button>
            <button className={btnGhost} onClick={() => fileRef.current?.click()}>⬆️ ייבוא מקובץ</button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const parsed = parseImported(await f.text());
                if (parsed) update(() => parsed);
                else alert("הקובץ לא תקין");
                e.target.value = "";
              }}
            />
            <p className="text-[11px] text-text-muted col-span-2 md:col-span-4">
              השער הנוכחי משמש רק לפריטים שעוד לא שולמו. כל הוצאה והזמנה ששולמו נשמרות עם השער של יום התשלום ולא משתנות.
            </p>
          </div>
        </Section>

        <ExpensesSection state={state} update={update} toIls={toIls} />
        <ItinerarySection state={state} update={update} toIls={toIls} />
        <BookingsSection state={state} update={update} toIls={toIls} />

        <Section
          id="checklist"
          title={`צ'קליסט הכנות · ${state.checklist.filter((c) => c.done).length}/${state.checklist.length}`}
        >
          <div className={`${cardCls} space-y-1`}>
            <Bar ratio={state.checklist.filter((c) => c.done).length / Math.max(1, state.checklist.length)} />
            <div className="pt-3 space-y-1">
              {state.checklist.map((item) => (
                <label key={item.id} className="flex items-center gap-3 py-2 border-b border-card-border/50 last:border-0 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() =>
                      update({ checklist: state.checklist.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c)) })
                    }
                    className="w-4 h-4 accent-[#1a8f64]"
                  />
                  <span className={item.done ? "line-through text-text-muted" : ""}>{item.label}</span>
                  <button
                    className="mr-auto text-xs text-text-muted hover:text-accent-red"
                    onClick={(e) => { e.preventDefault(); update({ checklist: state.checklist.filter((c) => c.id !== item.id) }); }}
                  >✕</button>
                </label>
              ))}
            </div>
            <AddLine placeholder="פריט חדש לצ'קליסט" onAdd={(label) => update({ checklist: [...state.checklist, { id: uid(), label, done: false }] })} />
          </div>
        </Section>

        <Section id="info" title="מידע">
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`${cardCls} space-y-3`}>
              <h3 className="font-bold text-sm">טיסות · Wizz Air</h3>
              {FLIGHTS.map((f) => (
                <div key={f.flightNumber} className="text-sm border-b border-card-border/50 last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span className="font-bold text-accent">{f.direction}</span>
                    <span dir="ltr">{f.flightNumber}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div><p className="font-bold">{f.from}</p><p className="text-xs text-text-muted" dir="ltr">{f.departs}</p></div>
                    <span className="text-text-muted">←</span>
                    <div className="text-left"><p className="font-bold">{f.to}</p><p className="text-xs text-text-muted" dir="ltr">{f.arrives}</p></div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${cardCls} space-y-2`}>
              <h3 className="font-bold text-sm">חירום</h3>
              {EMERGENCY.map((e) => (
                <div key={e.label} className="flex justify-between text-sm">
                  <span className="text-text-muted">{e.label}</span>
                  <a href={`tel:${e.value.replace(/\s/g, "")}`} dir="ltr" className="text-accent">{e.value}</a>
                </div>
              ))}
              <p className="text-[11px] text-text-muted pt-2">כדאי לאמת את המספרים לפני הנסיעה.</p>
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t border-card-border py-5 mt-8 text-center text-xs text-text-muted">
        הנתונים נשמרים בדפדפן של המכשיר הזה. לגיבוי או להעברה למכשיר אחר השתמשו בייצוא וייבוא.
      </footer>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "red" | "green" }) {
  return (
    <div className="bg-section-bg rounded-xl px-3 py-2">
      <p className="text-[11px] text-text-muted">{label}</p>
      <p className={`font-bold ${tone === "red" ? "text-accent-red" : tone === "green" ? "text-accent-green" : ""}`}>{value}</p>
    </div>
  );
}

function AddLine({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [v, setV] = useState("");
  const submit = () => { if (v.trim()) { onAdd(v.trim()); setV(""); } };
  return (
    <div className="flex gap-2 pt-3">
      <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder={placeholder} className={inputCls} />
      <button onClick={submit} className={btnCls}>הוסף</button>
    </div>
  );
}

type SectionProps = {
  state: TripState;
  update: (p: Partial<TripState> | ((s: TripState) => TripState)) => void;
  toIls: (n: number, c: Currency, rate?: number) => number;
};

function ExpensesSection({ state, update, toIls }: SectionProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [category, setCategory] = useState<CategoryId>("food");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const add = () => {
    const n = Number(amount);
    if (!n || n <= 0) return;
    const e: Expense = {
      id: uid(), date, amount: n, currency, category, note: note.trim(), paidBy: paidBy.trim(),
      rate: currency === "EUR" ? state.eurRate : undefined,
    };
    update({ expenses: [e, ...state.expenses] });
    setAmount(""); setNote("");
  };

  const sorted = [...state.expenses].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Section id="expenses" title={`הוצאות · ${state.expenses.length}`}>
      <div className={`${cardCls} space-y-3`}>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" inputMode="decimal" placeholder="סכום" value={amount} onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} className={`${inputCls} text-lg font-bold`} autoFocus={false} />
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={inputCls}>
            <option value="EUR">€ אירו</option>
            <option value="ILS">₪ שקל</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          <input placeholder="מי שילם" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className={inputCls} />
          <input placeholder="הערה" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} className={inputCls} />
        </div>
        <button onClick={add} className={`${btnCls} w-full`}>➕ הוסף הוצאה</button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-4">עדיין אין הוצאות. הטופס למעלה בנוי לשלוש הקשות מהטלפון.</p>
      ) : (
        <div className={`${cardCls} divide-y divide-card-border/50`}>
          {sorted.map((e) => (
            <div key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="text-lg">{CATEGORY_MAP[e.category].icon}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate">{e.note || CATEGORY_MAP[e.category].label}</p>
                <p className="text-[11px] text-text-muted">{fmtDate(e.date)}{e.paidBy ? ` · ${e.paidBy}` : ""}</p>
              </div>
              <div className="text-left">
                <p className="font-bold">{e.currency === "EUR" ? eur(e.amount) : ils(e.amount)}</p>
                {e.currency === "EUR" && (
                  <p className="text-[11px] text-text-muted">
                    {ils(toIls(e.amount, "EUR", e.rate))} · שער{" "}
                    <input
                      type="number" step="0.001" value={e.rate ?? ""}
                      onChange={(ev) => update({ expenses: state.expenses.map((x) => x.id === e.id ? { ...x, rate: Number(ev.target.value) || undefined } : x) })}
                      className="w-14 px-1 rounded bg-section-bg border border-card-border text-[11px] text-left"
                    />
                  </p>
                )}
              </div>
              <button onClick={() => update({ expenses: state.expenses.filter((x) => x.id !== e.id) })} className="text-xs text-text-muted hover:text-accent-red">✕</button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function ItinerarySection({ state, update, toIls }: SectionProps) {
  const today = todayIso();
  const spentByDay = new Map<string, number>();
  for (const e of state.expenses) spentByDay.set(e.date, (spentByDay.get(e.date) ?? 0) + toIls(e.amount, e.currency, e.rate));

  const setDay = (date: string, patch: Partial<{ city: string; plan: string }>) =>
    update({ itinerary: state.itinerary.map((d) => (d.date === date ? { ...d, ...patch } : d)) });

  return (
    <Section id="itinerary" title="מסלול יומי">
      <div className={`${cardCls} divide-y divide-card-border/50`}>
        {state.itinerary.map((d, i) => {
          const isToday = d.date === today;
          return (
            <div key={d.date} className={`py-3 grid grid-cols-[64px_1fr] md:grid-cols-[80px_160px_1fr_90px] gap-2 items-start ${isToday ? "bg-accent/5 -mx-5 px-5" : ""}`}>
              <div>
                <p className="text-sm font-bold">יום {i + 1}</p>
                <p className="text-[11px] text-text-muted">{weekday(d.date)} {fmtDate(d.date)}</p>
              </div>
              <input value={d.city} onChange={(e) => setDay(d.date, { city: e.target.value })} placeholder="עיר" className={`${inputCls} py-1.5`} />
              <input value={d.plan} onChange={(e) => setDay(d.date, { plan: e.target.value })} placeholder="מה מתוכנן" className={`${inputCls} py-1.5 col-span-2 md:col-span-1`} />
              <p className="text-xs text-text-muted text-left self-center hidden md:block">{spentByDay.has(d.date) ? ils(spentByDay.get(d.date)!) : ""}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function BookingsSection({ state, update, toIls }: SectionProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [category, setCategory] = useState<CategoryId>("lodging");
  const [dueDate, setDueDate] = useState(TRIP.startDate);
  const [paid, setPaid] = useState(false);

  const add = () => {
    if (!title.trim()) return;
    const b: Booking = {
      id: uid(), title: title.trim(), amount: Number(amount) || 0, currency, category, dueDate, paid, reference: "",
      paidDate: paid ? todayIso() : undefined,
      rate: paid && currency === "EUR" ? state.eurRate : undefined,
    };
    update({ bookings: [...state.bookings, b] });
    setTitle(""); setAmount("");
  };
  const patch = (id: string, p: Partial<Booking>) =>
    update({ bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...p } : b)) });

  const sorted = [...state.bookings].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  const unpaid = sorted.filter((b) => !b.paid);

  return (
    <Section id="bookings" title="הזמנות ותשלומים">
      {unpaid.length > 0 && (
        <div className={`${cardCls} border-accent/40`}>
          <h3 className="font-bold text-sm mb-2">לתשלום בהמשך · {ils(unpaid.reduce((a, b) => a + toIls(b.amount, b.currency), 0))}</h3>
          {unpaid.map((b) => (
            <div key={b.id} className="flex justify-between text-sm py-1">
              <span>{fmtDate(b.dueDate)} · {b.title}</span>
              <span className="font-bold">{b.currency === "EUR" ? `${eur(b.amount)} ≈ ${ils(toIls(b.amount, "EUR"))}` : ils(b.amount)}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`${cardCls} divide-y divide-card-border/50`}>
        {sorted.map((b) => (
          <div key={b.id} className="py-2.5 flex flex-wrap items-center gap-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={b.paid}
                onChange={() =>
                  patch(b.id, b.paid
                    ? { paid: false, paidDate: undefined, rate: undefined }
                    : { paid: true, paidDate: todayIso(), rate: b.currency === "EUR" ? state.eurRate : undefined })
                }
                className="w-4 h-4 accent-[#1a8f64]"
              />
              <span className={b.paid ? "text-text-muted" : ""}>{CATEGORY_MAP[b.category].icon} {b.title}</span>
            </label>
            <span className="text-[11px] text-text-muted">
              {fmtDate(b.dueDate)}{b.reference ? ` · ${b.reference}` : ""}
              {b.currency === "EUR" && (
                <>
                  {" · "}{ils(toIls(b.amount, "EUR", b.rate))}
                  {b.paid ? (
                    <>
                      {" · שולם "}{b.paidDate ? fmtDate(b.paidDate) : ""}{" · חויב בפועל ₪ "}
                      <input
                        type="number" step="1" placeholder="..."
                        value={b.rate ? Math.round(b.amount * b.rate) : ""}
                        onChange={(e) => {
                          const paidIls = Number(e.target.value);
                          patch(b.id, { rate: paidIls > 0 && b.amount > 0 ? paidIls / b.amount : undefined });
                        }}
                        className="w-16 px-1 rounded bg-section-bg border border-card-border text-[11px] text-left"
                      />
                      {b.rate ? ` (שער ${b.rate.toFixed(3)})` : ""}
                    </>
                  ) : " · לפי שער נוכחי"}
                </>
              )}
            </span>
            <div className="mr-auto flex items-center gap-1">
              <input type="number" value={b.amount} onChange={(e) => patch(b.id, { amount: Number(e.target.value) || 0 })} className="w-24 px-2 py-1 rounded-lg bg-section-bg border border-card-border text-xs text-left" />
              <select value={b.currency} onChange={(e) => patch(b.id, { currency: e.target.value as Currency })} className="px-1 py-1 rounded-lg bg-section-bg border border-card-border text-xs">
                <option value="EUR">€</option><option value="ILS">₪</option>
              </select>
              <button onClick={() => update({ bookings: state.bookings.filter((x) => x.id !== b.id) })} className="text-xs text-text-muted hover:text-accent-red px-1">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className={`${cardCls} space-y-2`}>
        <h3 className="font-bold text-sm">הזמנה חדשה</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <input placeholder="שם (מלון בווינה, רכב...)" value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputCls} col-span-2`} />
          <input type="number" inputMode="decimal" placeholder="סכום" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={inputCls}>
            <option value="EUR">€ אירו</option><option value="ILS">₪ שקל</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={paid} onChange={() => setPaid(!paid)} className="w-4 h-4 accent-[#1a8f64]" /> כבר שולם
          </label>
          <button onClick={add} className={`${btnCls} mr-auto`}>הוסף הזמנה</button>
        </div>
      </div>
    </Section>
  );
}
