import { NextResponse } from "next/server";

// שער אירו לשקל. מקור ראשי: Frankfurter (נתוני הבנק המרכזי האירופי), תומך גם בתאריך היסטורי.
// גיבוי: open.er-api.com, שער נוכחי בלבד.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const path = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "latest";

  try {
    const res = await fetch(`https://api.frankfurter.app/${path}?from=EUR&to=ILS`, {
      next: { revalidate: path === "latest" ? 3600 : 86400 * 30 },
    });
    if (res.ok) {
      const data = (await res.json()) as { date: string; rates: { ILS?: number } };
      if (data.rates?.ILS) {
        return NextResponse.json({ rate: data.rates.ILS, date: data.date, source: "ECB" });
      }
    }
  } catch {
    // ממשיכים לגיבוי
  }

  if (path === "latest") {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/EUR", { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = (await res.json()) as { rates?: { ILS?: number }; time_last_update_utc?: string };
        if (data.rates?.ILS) {
          return NextResponse.json({
            rate: data.rates.ILS,
            date: new Date(data.time_last_update_utc ?? Date.now()).toISOString().slice(0, 10),
            source: "er-api",
          });
        }
      }
    } catch {
      // אין שער זמין
    }
  }

  return NextResponse.json({ error: "rate unavailable" }, { status: 502 });
}
