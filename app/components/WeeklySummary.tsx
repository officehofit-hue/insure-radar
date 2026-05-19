"use client";

import { useEffect, useRef } from "react";

function MarketOverview() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "light",
      dateRange: "1W",
      showChart: true,
      locale: "he_IL",
      width: "100%",
      height: 400,
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      plotLineColorGrowing: "rgba(30, 58, 95, 1)",
      plotLineColorFalling: "rgba(201, 61, 61, 1)",
      gridLineColor: "rgba(226, 221, 212, 0.5)",
      scaleFontColor: "rgba(122, 116, 104, 1)",
      belowLineFillColorGrowing: "rgba(30, 58, 95, 0.05)",
      belowLineFillColorFalling: "rgba(201, 61, 61, 0.05)",
      belowLineFillColorGrowingBottom: "rgba(30, 58, 95, 0)",
      belowLineFillColorFallingBottom: "rgba(201, 61, 61, 0)",
      symbolActiveColor: "rgba(184, 148, 46, 0.07)",
      tabs: [
        {
          title: "ביטוח ישראלי",
          symbols: [
            { s: "TASE:MNRH", d: "מנורה מבטחים" },
            { s: "TASE:HARL", d: "הראל" },
            { s: "TASE:MGDL", d: "מגדל" },
            { s: "TASE:KLIL", d: "כלל ביטוח" },
            { s: "TASE:PHNX", d: "הפניקס" },
          ],
        },
        {
          title: "מדדי ת\"א",
          symbols: [
            { s: "TASE:TA35", d: "ת״א 35" },
            { s: "TASE:TA125", d: "ת״א 125" },
            { s: "TASE:TA90", d: "ת״א 90" },
            { s: "FX_IDC:USDILS", d: "דולר/שקל" },
            { s: "FX_IDC:EURILS", d: "יורו/שקל" },
          ],
        },
        {
          title: "עולמי",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "NASDAQ" },
            { s: "INDEX:DEU40", d: "DAX" },
            { s: "BITSTAMP:BTCUSD", d: "Bitcoin" },
            { s: "COMEX:GC1!", d: "זהב" },
          ],
        },
      ],
    });
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div ref={containerRef} className="rounded-xl overflow-hidden">
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default function WeeklySummary() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("he-IL", { day: "numeric", month: "short" });

  return (
    <section id="weekly" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">&#x1F4CB; סיכום שבועי</h2>
        <span className="text-xs text-text-muted bg-section-bg px-3 py-1 rounded-full border border-card-border">
          {formatDate(weekStart)} &ndash; {formatDate(weekEnd)}
        </span>
      </div>

      <div className="border border-card-border rounded-2xl bg-card-bg p-4 shadow-sm">
        <MarketOverview />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-card-border rounded-2xl bg-card-bg p-4 shadow-sm">
          <div className="text-sm font-semibold mb-2">&#x1F3E6; מניות ביטוח</div>
          <p className="text-xs text-text-muted leading-relaxed">
            עקבו אחרי ביצועי חברות הביטוח המובילות בטאב &quot;ביטוח ישראלי&quot; למעלה.
          </p>
        </div>
        <div className="border border-card-border rounded-2xl bg-card-bg p-4 shadow-sm">
          <div className="text-sm font-semibold mb-2">&#x1F4C8; מדדי ת&quot;א</div>
          <p className="text-xs text-text-muted leading-relaxed">
            עברו לטאב &quot;מדדי ת&quot;א&quot; לראות ביצועי מדדים ושערי מט&quot;ח השבוע.
          </p>
        </div>
        <div className="border border-card-border rounded-2xl bg-card-bg p-4 shadow-sm">
          <div className="text-sm font-semibold mb-2">&#x1F30D; שווקים עולמיים</div>
          <p className="text-xs text-text-muted leading-relaxed">
            טאב &quot;עולמי&quot; מציג S&amp;P 500, נאסד&quot;ק, ביטקוין וזהב.
          </p>
        </div>
      </div>
    </section>
  );
}
