"use client";

import { useState, useEffect } from "react";

interface Article {
  title: string;
  link: string;
  snippet: string;
  source: string;
  sourceIcon: string;
  pubDate: string;
}

interface NewsData {
  sources: { name: string; icon: string }[];
  articles: Article[];
  stats?: { total: number; insurance: number; general: number };
}

const MENORA_KEYWORDS = ["מנורה מבטחים", "מנורה מבטחים החזקות"];
const MENORA_FUZZY = ["מנורה"];

/* Exact names — safe to match alone (unambiguous) */
const COMPETITOR_EXACT: Record<string, string> = {
  "הראל ביטוח": "הראל",
  "הראל פיננסים": "הראל",
  "קבוצת הראל": "הראל",
  "מגדל ביטוח": "מגדל",
  "מגדל שוקי הון": "מגדל",
  "קבוצת מגדל": "מגדל",
  "כלל ביטוח": "כלל",
  "כלל החזקות": "כלל",
  "הפניקס ביטוח": "הפניקס",
  "הפניקס החזקות": "הפניקס",
  "קבוצת הפניקס": "הפניקס",
  "איילון ביטוח": "איילון",
  "איילון החזקות": "איילון",
  "שומרה ביטוח": "שומרה",
  "מיטב דש": "מיטב",
  "מיטב השקעות": "מיטב",
  "אלטשולר שחם": "אלטשולר",
  "ביטוח ישיר": "ביטוח ישיר",
};

/* Fuzzy names — common Hebrew words, need insurance context */
const COMPETITOR_FUZZY: Record<string, string> = {
  "הראל": "הראל",
  "מגדל": "מגדל",
  "הפניקס": "הפניקס",
  "פניקס": "הפניקס",
  "איילון": "איילון",
  "שומרה": "שומרה",
  "מיטב": "מיטב",
  "אלטשולר": "אלטשולר",
};

/* Insurance/finance context — confirms fuzzy matches are about the company */
const INSURANCE_CONTEXT = [
  "ביטוח", "מבטחים", "פוליס", "פרמי", "תביע", "חיתום", "סיעוד",
  "פנסי", "גמל", "השתלמות", "פרישה", "אקטואר",
  "אובדן כושר", "ביטוח משנה", "דמי ניהול",
  "קרן פנסיה", "קופת גמל", "קופות גמל",
  "בורסה", "מניות", "מנייה", "שוק ההון", "תשואה", "דיבידנד",
  "דוח כספי", "דוחות כספיים", "רבעון", "מאזן",
  "רשות שוק ההון", "הממונה על", "רגולצי",
  "חברת ביטוח", "חברות ביטוח", "ענף הביטוח", "שוק הביטוח",
  "מנכ\"ל", "יו\"ר", "דירקטוריון",
];

function hasInsuranceContext(text: string): boolean {
  return INSURANCE_CONTEXT.some((kw) => text.includes(kw));
}

function detectMenora(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`;
  // Exact match first
  if (MENORA_KEYWORDS.some((kw) => text.includes(kw))) return true;
  // Fuzzy: "מנורה" alone — only if insurance context exists
  if (MENORA_FUZZY.some((kw) => text.includes(kw)) && hasInsuranceContext(text)) return true;
  return false;
}

function detectCompetitor(title: string, snippet: string): string | null {
  const text = `${title} ${snippet}`;
  // Pass 1: exact names — high confidence
  for (const [kw, name] of Object.entries(COMPETITOR_EXACT)) {
    if (text.includes(kw)) return name;
  }
  // Pass 2: fuzzy names — only with insurance context
  if (!hasInsuranceContext(text)) return null;
  for (const [kw, name] of Object.entries(COMPETITOR_FUZZY)) {
    if (text.includes(kw)) return name;
  }
  return null;
}

const INSURANCE_KEYWORDS = [
  "ביטוח", "פוליס", "פרמי", "תביע", "חיתום", "סיעוד",
  "מבטחים", "פנסי", "גמל", "השתלמות", "פרישה",
  "רשות שוק ההון", "הממונה על", "רגולצי", "חוזר",
  "אקטואר", "סיכון", "שמאי", "מוטב",
  "אובדן כושר", "ביטוח משנה", "דמי ניהול",
  "קרן פנסיה", "קופת גמל",
  "חברת ביטוח", "חברות ביטוח", "ענף הביטוח", "שוק הביטוח",
];

function isInsuranceArticle(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`;
  return INSURANCE_KEYWORDS.some((kw) => text.includes(kw));
}

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

type Filter = "all" | "menora" | "competitors" | "market";

export default function News() {
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const filteredArticles = data?.articles.filter((a) => {
    if (filter === "all") return true;
    const isMenora = detectMenora(a.title, a.snippet);
    const competitor = detectCompetitor(a.title, a.snippet);
    if (filter === "menora") return isMenora;
    if (filter === "competitors") return competitor !== null;
    if (filter === "market") return !isMenora && !competitor;
    return true;
  }) || [];

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "הכל" },
    { key: "menora", label: "מנורה" },
    { key: "competitors", label: "מתחרים" },
    { key: "market", label: "שוק כללי" },
  ];

  return (
    <section id="news" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">&#x1F4F0; חדשות שוק הביטוח</h2>
          {data?.stats && (
            <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-accent/10 text-accent border border-accent/20">
              {data.stats.total} כתבות
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-accent text-white"
                  : "bg-section-bg text-text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

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

      {error && (
        <div className="border border-card-border rounded-xl bg-card-bg p-8 text-center text-text-muted">
          <p className="text-3xl mb-3">&#x1F4E1;</p>
          <p className="font-medium">לא הצלחנו לטעון חדשות כרגע</p>
          <p className="text-sm mt-1">נסה לרענן את הדף</p>
        </div>
      )}

      {data && filteredArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article, i) => {
            const isMenora = detectMenora(article.title, article.snippet);
            const competitor = detectCompetitor(article.title, article.snippet);
            const isInsurance = isInsuranceArticle(article.title, article.snippet);
            return (
              <a
                key={`${article.source}-${i}`}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`card-hover block border rounded-xl bg-card-bg p-5 transition-all ${
                  isMenora
                    ? "border-accent/40 ring-1 ring-accent/10"
                    : competitor
                    ? "border-accent-orange/30"
                    : isInsurance
                    ? "border-accent/20"
                    : "border-card-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{article.sourceIcon}</span>
                  <span className="text-xs text-text-muted font-medium">
                    {article.source}
                  </span>
                  {isMenora && <span className="menora-badge">מנורה</span>}
                  {competitor && (
                    <span className="competitor-badge">מתחרה: {competitor}</span>
                  )}
                  {!isMenora && !competitor && isInsurance && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                      ביטוח
                    </span>
                  )}
                  <span className="text-xs text-text-muted mr-auto">
                    {timeAgo(article.pubDate)}
                  </span>
                </div>
                <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2 text-foreground">
                  {article.title}
                </h3>
                {article.snippet && (
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    {article.snippet}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      )}

      {data && filteredArticles.length === 0 && !error && (
        <div className="border border-card-border rounded-xl bg-card-bg p-8 text-center text-text-muted">
          <p className="text-3xl mb-3">&#x1F4F0;</p>
          <p className="font-medium">אין כתבות בפילטר הנבחר</p>
          <p className="text-sm mt-1">נסה פילטר אחר</p>
        </div>
      )}

      <p className="text-xs text-text-muted text-center">
        מקורות: גלובס, כלכליסט, דה מרקר, ביזפורטל
      </p>
    </section>
  );
}
