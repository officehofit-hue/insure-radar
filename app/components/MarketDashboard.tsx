"use client";

import { useEffect, useRef } from "react";

function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "TASE:TA35", title: "ת״א 35" },
        { proName: "TASE:TA125", title: "ת״א 125" },
        { proName: "TASE:MNRH", title: "מנורה" },
        { proName: "TASE:HARL", title: "הראל" },
        { proName: "TASE:MGDL", title: "מגדל" },
        { proName: "TASE:KLIL", title: "כלל" },
        { proName: "TASE:PHNX", title: "הפניקס" },
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "FOREXCOM:NSXUSD", title: "NASDAQ" },
        { proName: "FX_IDC:USDILS", title: "USD/ILS" },
        { proName: "FX_IDC:EURILS", title: "EUR/ILS" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "COMEX:GC1!", title: "Gold" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "light",
      locale: "he_IL",
    });
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default function MarketDashboard() {
  return (
    <section id="markets" className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">&#x1F4CA; מדדים ומניות ביטוח</h2>
        <span className="flex items-center gap-1 text-[11px] text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green pulse-dot"></span>
          בזמן אמת
        </span>
      </div>
      <div className="rounded-2xl overflow-hidden border border-card-border bg-card-bg p-3 shadow-sm">
        <TradingViewTicker />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { name: "מנורה מבטחים", symbol: "MNRH", color: "text-accent-blue" },
          { name: "הראל ביטוח", symbol: "HARL", color: "text-accent-green" },
          { name: "מגדל ביטוח", symbol: "MGDL", color: "text-violet-700" },
          { name: "כלל ביטוח", symbol: "KLIL", color: "text-orange-600" },
          { name: "הפניקס", symbol: "PHNX", color: "text-red-600" },
        ].map((company) => (
          <div
            key={company.symbol}
            className="border border-card-border rounded-xl bg-card-bg p-3 text-center"
          >
            <p className={`text-xs font-bold ${company.color}`}>{company.name}</p>
            <p className="text-[10px] text-text-muted font-mono mt-0.5">TASE:{company.symbol}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
