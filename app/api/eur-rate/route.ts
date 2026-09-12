import { NextResponse } from "next/server";

// שער אירו לשקל מבנק ישראל.
// שער נוכחי: PublicApi של בנק ישראל. שער היסטורי לפי תאריך: שירות הנתונים (SDMX) של בנק ישראל.

const BOI_LATEST = "https://boi.org.il/PublicApi/GetExchangeRate?key=EUR";
const BOI_SERIES =
  "https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_EUR_ILS";

async function latest() {
  const res = await fetch(BOI_LATEST, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = (await res.json()) as { currentExchangeRate?: number; lastUpdate?: string };
  if (typeof data.currentExchangeRate !== "number") return null;
  return {
    rate: data.currentExchangeRate,
    date: (data.lastUpdate ?? new Date().toISOString()).slice(0, 10),
    source: "בנק ישראל",
  };
}

async function historical(date: string) {
  // מבקשים חלון של כמה ימים אחורה כדי לכסות שבת וחג, ולוקחים את השער האחרון שפורסם עד התאריך
  const from = new Date(date + "T00:00:00Z");
  from.setUTCDate(from.getUTCDate() - 7);
  const url = `${BOI_SERIES}?startperiod=${from.toISOString().slice(0, 10)}&endperiod=${date}&format=csv`;
  const res = await fetch(url, { next: { revalidate: 86400 * 30 } });
  if (!res.ok) return null;
  const text = await res.text();
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0]?.split(",").map((h) => h.trim().toUpperCase()) ?? [];
  const ti = header.indexOf("TIME_PERIOD");
  const vi = header.indexOf("OBS_VALUE");
  if (ti < 0 || vi < 0) return null;
  let best: { rate: number; date: string } | null = null;
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const d = cols[ti]?.trim();
    const v = Number(cols[vi]);
    if (d && d <= date && Number.isFinite(v) && (!best || d > best.date)) best = { rate: v, date: d };
  }
  return best ? { ...best, source: "בנק ישראל" } : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  try {
    const result =
      date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? await historical(date) : await latest();
    if (result) return NextResponse.json(result);
  } catch {
    // אין שער זמין
  }
  return NextResponse.json({ error: "rate unavailable" }, { status: 502 });
}
