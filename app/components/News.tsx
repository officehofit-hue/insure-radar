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

const INSURANCE_KEYWORDS = [
  "ביטוח", "פוליס", "פרמי", "תביע", "חיתום", "סיעוד",
  "מנורה", "הראל", "מגדל", "כלל ביטוח", "הפניקס", "איילון",
  "שומרה", "מבטחים", "פנסי", "גמל", "השתלמות", "פרישה",
  "רשות שוק ההון", "הממונה על", "רגולצי", "חוזר",
  "אקטואר", "סיכון", "שמאי", "מוטב",
  "אובדן כושר", "ביטוח משנה", "דמי ניהול",
  "קרן פנסיה", "קופת גמל",
];

function isInsuranceArticle(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  return INSURANCE_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
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

export default function News() {
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  return (
    <section id="news" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">&#x1F4F0; חדשות ביטוח ופיננסים</h2>
          {data?.stats && (
            <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-accent/10 text-accent border border-accent/20">
              {data.stats.insurance} כתבות ביטוח
            </span>
          )}
        </div>
        {data?.sources && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>מקורות:</span>
            {data.sources.map((s) => (
              <span
                key={s.name}
                className="bg-card-bg border border-card-border px-2 py-0.5 rounded-md text-xs"
              >
                {s.icon} {s.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border border-card-border rounded-xl bg-card-bg p-5"
            >
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

      {data && data.articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.articles.map((article, i) => {
            const isInsurance = isInsuranceArticle(article.title, article.snippet);
            return (
              <a
                key={`${article.source}-${i}`}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`card-hover block border rounded-xl bg-card-bg p-5 transition-all ${
                  isInsurance ? "border-accent/30" : "border-card-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{article.sourceIcon}</span>
                  <span className="text-xs text-text-muted font-medium">
                    {article.source}
                  </span>
                  {isInsurance && (
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

      {data && data.articles.length === 0 && !error && (
        <div className="border border-card-border rounded-xl bg-card-bg p-8 text-center text-text-muted">
          <p className="text-3xl mb-3">&#x1F4F0;</p>
          <p className="font-medium">אין חדשות זמינות כרגע</p>
          <p className="text-sm mt-1">נסה שוב מאוחר יותר</p>
        </div>
      )}

      <p className="text-xs text-text-muted text-center">
        ~80% חדשות ביטוח &middot; מקורות: גלובס, כלכליסט, דה מרקר, ביזפורטל
      </p>
    </section>
  );
}
