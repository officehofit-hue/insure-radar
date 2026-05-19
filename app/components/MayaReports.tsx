"use client";

import { useState, useEffect } from "react";

interface InsuranceCompany {
  name: string;
  taseId: string;
  symbol: string;
  color: string;
  mayaUrl: string;
  marketUrl: string;
}

interface FeedItem {
  company: string;
  companySymbol: string;
  companyIcon: string;
  mayaLink: string;
  title: string;
  snippet: string;
  source: string;
  sourceIcon: string;
  pubDate: string;
  reportType: string;
  articleLink: string;
}

const insuranceCompanies: InsuranceCompany[] = [
  {
    name: "מנורה מבטחים",
    taseId: "572",
    symbol: "MNRH",
    color: "from-blue-600 to-blue-800",
    mayaUrl: "https://maya.tase.co.il/he/company/572",
    marketUrl: "https://market.tase.co.il/he/market_data/company/572/reports_maya",
  },
  {
    name: "הראל ביטוח ופיננסים",
    taseId: "825",
    symbol: "HARL",
    color: "from-emerald-600 to-emerald-800",
    mayaUrl: "https://maya.tase.co.il/he/company/825",
    marketUrl: "https://market.tase.co.il/he/market_data/company/825/reports_maya",
  },
  {
    name: "מגדל ביטוח",
    taseId: "604",
    symbol: "MGDL",
    color: "from-violet-600 to-violet-800",
    mayaUrl: "https://maya.tase.co.il/he/company/604",
    marketUrl: "https://market.tase.co.il/he/market_data/company/604/reports_maya",
  },
  {
    name: "כלל ביטוח",
    taseId: "224",
    symbol: "KLIL",
    color: "from-orange-600 to-orange-800",
    mayaUrl: "https://maya.tase.co.il/he/company/224",
    marketUrl: "https://market.tase.co.il/he/market_data/company/224/reports_maya",
  },
  {
    name: "הפניקס",
    taseId: "1041",
    symbol: "PHNX",
    color: "from-red-600 to-red-800",
    mayaUrl: "https://maya.tase.co.il/he/company/1041",
    marketUrl: "https://market.tase.co.il/he/market_data/company/1041/reports_maya",
  },
];

const typeStyle: Record<string, { bg: string; text: string }> = {
  "דוח כספי": { bg: "bg-blue-600/10", text: "text-blue-700" },
  "דיווח מיידי": { bg: "bg-red-600/10", text: "text-red-700" },
  "דיבידנד": { bg: "bg-green-600/10", text: "text-green-700" },
  "הנפקה": { bg: "bg-emerald-600/10", text: "text-emerald-700" },
  "ממשל תאגידי": { bg: "bg-purple-600/10", text: "text-purple-700" },
  "עסקה": { bg: "bg-orange-600/10", text: "text-orange-700" },
  "רגולציה": { bg: "bg-violet-600/10", text: "text-violet-700" },
  "עדכון": { bg: "bg-gray-200/60", text: "text-gray-600" },
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "עכשיו";
  if (diffMin < 60) return `לפני ${diffMin} דקות`;
  if (diffHr < 24) return `לפני ${diffHr} שעות`;
  if (diffDay === 1) return "אתמול";
  return `לפני ${diffDay} ימים`;
}

export default function MayaReports() {
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/maya-feed")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <section id="maya" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">&#x1F3E6; דיווחי מאיה — הבורסה</h2>
          <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
            TASE
          </span>
          {items.length > 0 && (
            <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-accent/10 text-accent border border-accent/20">
              {items.length} עדכונים
            </span>
          )}
        </div>
        <a
          href="https://maya.tase.co.il/he/reports/companies"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-blue hover:underline font-medium"
        >
          &#x2192; לכל הדיווחים במאיה
        </a>
      </div>

      {/* Insurance Companies Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {insuranceCompanies.map((company) => (
          <div
            key={company.taseId}
            className={`card-hover border border-card-border rounded-xl bg-card-bg overflow-hidden shadow-sm ${
              activeCompany === company.taseId ? "ring-2 ring-accent" : ""
            }`}
          >
            <div className={`h-1.5 bg-gradient-to-l ${company.color}`}></div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-sm mb-1">{company.name}</h3>
              <p className="text-[10px] text-text-muted font-mono mb-3">
                TASE:{company.symbol}
              </p>
              <div className="flex flex-col gap-1.5">
                <a
                  href={company.marketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-1.5 rounded-lg bg-accent-blue/10 text-accent-blue text-[11px] font-medium hover:bg-accent-blue/20 transition-colors text-center"
                  onClick={() => setActiveCompany(company.taseId)}
                >
                  &#x1F4C4; דיווחי מאיה
                </a>
                <a
                  href={company.mayaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-1.5 rounded-lg bg-section-bg text-text-muted text-[11px] font-medium hover:text-foreground transition-colors text-center"
                >
                  &#x1F3E2; עמוד חברה
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-card-border rounded-xl bg-card-bg p-5">
              <div className="h-4 shimmer rounded w-3/4 mb-3"></div>
              <div className="h-3 shimmer rounded w-full mb-2"></div>
              <div className="h-3 shimmer rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border border-card-border rounded-xl bg-card-bg p-8 text-center text-text-muted">
          <p className="text-3xl mb-3">&#x1F4E1;</p>
          <p className="font-medium">לא הצלחנו לטעון דיווחים כרגע</p>
          <p className="text-sm mt-1">נסה לרענן את הדף</p>
        </div>
      )}

      {/* Feed — auto-detected alerts, news-style cards */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, i) => {
            const style = typeStyle[item.reportType] || typeStyle["עדכון"];
            return (
              <a
                key={`maya-${i}`}
                href={item.articleLink || item.mayaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover block border border-accent/30 rounded-xl bg-card-bg p-5 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{item.companyIcon}</span>
                  <span className="text-xs text-text-muted font-medium">
                    {item.company}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}>
                    {item.reportType}
                  </span>
                  <span className="text-xs text-text-muted mr-auto">
                    {timeAgo(item.pubDate)}
                  </span>
                </div>
                <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2 text-foreground">
                  {item.title}
                </h3>
                {item.snippet && (
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    {item.snippet}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-card-border/50">
                  <span className="text-[10px] text-text-muted">
                    {item.sourceIcon} {item.source}
                  </span>
                  <span className="text-[10px] text-accent-blue mr-auto">
                    &#x2192; צפה במאיה
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      <p className="text-xs text-text-muted text-center">
        מקור: מאיה &mdash; מערכת אינטרנט להודעות &middot; הבורסה לניירות ערך בתל אביב &middot; גלובס, דה מרקר, כלכליסט, ביזפורטל
      </p>
    </section>
  );
}
