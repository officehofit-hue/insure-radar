import { NextResponse } from "next/server";
import Parser from "rss-parser";

interface NewsSource {
  name: string;
  rssUrl: string;
  icon: string;
  priority: "insurance" | "general";
}

// Insurance-related keywords for filtering
const INSURANCE_KEYWORDS = [
  "ביטוח", "פוליס", "פרמי", "תביע", "חיתום", "סיעוד",
  "מנורה", "הראל", "מגדל", "כלל ביטוח", "הפניקס", "איילון",
  "שומרה", "ביטוח לאומי", "מבטחים",
  "פנסי", "גמל", "השתלמות", "פרישה", "פיצויים",
  "רשות שוק ההון", "הממונה על", "רגולצי", "חוזר",
  "אקטואר", "סיכון", "שמאי", "מוטב", "נהנה",
  "ביטוח רכב", "ביטוח דירה", "ביטוח בריאות", "ביטוח חיים",
  "ביטוח משנה", "אובדן כושר", "ביטוח נסיעות",
  "קרן פנסיה", "קופת גמל", "ביטוח מנהלים",
  "דמי ניהול", "תשואה", "צבירה",
  "insurtech", "אינשורטק",
];

function isInsuranceRelated(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  return INSURANCE_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

// Sources: insurance-focused first, then general financial
const allSources: NewsSource[] = [
  // Insurance-focused sources (always fetched)
  {
    name: "גלובס ביטוח",
    rssUrl: "https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=585",
    icon: "🟠",
    priority: "insurance",
  },
  {
    name: "דה מרקר",
    rssUrl: "https://www.themarker.com/cmlink/1.145",
    icon: "🟢",
    priority: "insurance",
  },
  {
    name: "ביזפורטל",
    rssUrl: "https://www.bizportal.co.il/rss/bizportalrss.xml",
    icon: "🟦",
    priority: "insurance",
  },
  // General financial (for the remaining 20%)
  {
    name: "כלכליסט",
    rssUrl: "https://www.calcalist.co.il/GeneralRSS/0,16335,L-8,00.xml",
    icon: "🔴",
    priority: "general",
  },
];

export async function GET() {
  const parser = new Parser({
    timeout: 8000,
    headers: {
      "User-Agent": "InsureRadar/1.0",
    },
  });

  interface Article {
    title: string;
    link: string;
    snippet: string;
    source: string;
    sourceIcon: string;
    pubDate: string;
    isInsurance: boolean;
  }

  const allArticles: Article[] = [];
  const activeSources: { name: string; icon: string }[] = [];

  // Fetch from ALL sources (not just 2) to maximize insurance content
  await Promise.allSettled(
    allSources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.rssUrl);
        const items = (feed.items || []).slice(0, 8); // Fetch more items per source
        let hasArticles = false;

        for (const item of items) {
          if (!item.title) continue;
          const rawSnippet =
            item.contentSnippet || item.content || item.summary || "";
          const snippet = rawSnippet
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim()
            .slice(0, 180);

          const title = item.title.trim();
          const isInsurance = isInsuranceRelated(title, snippet);

          allArticles.push({
            title,
            link: item.link || "",
            snippet,
            source: source.name,
            sourceIcon: source.icon,
            pubDate: item.pubDate || item.isoDate || "",
            isInsurance,
          });
          hasArticles = true;
        }

        if (hasArticles) {
          activeSources.push({ name: source.name, icon: source.icon });
        }
      } catch {
        // Source unavailable, skip
      }
    })
  );

  // Sort all articles by date
  allArticles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  // Split into insurance and general
  const insuranceArticles = allArticles.filter((a) => a.isInsurance);
  const generalArticles = allArticles.filter((a) => !a.isInsurance);

  // Build final list: ~80% insurance, ~20% general
  const TOTAL = 10;
  const INSURANCE_COUNT = Math.min(Math.ceil(TOTAL * 0.8), insuranceArticles.length);
  const GENERAL_COUNT = Math.min(TOTAL - INSURANCE_COUNT, generalArticles.length);

  const finalArticles = [
    ...insuranceArticles.slice(0, INSURANCE_COUNT),
    ...generalArticles.slice(0, GENERAL_COUNT),
  ];

  // Re-sort by date for natural display
  finalArticles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  // Remove isInsurance flag before sending
  const cleanArticles = finalArticles.map(({ isInsurance, ...rest }) => rest);

  return NextResponse.json({
    sources: activeSources,
    articles: cleanArticles,
    stats: {
      total: cleanArticles.length,
      insurance: INSURANCE_COUNT,
      general: GENERAL_COUNT,
    },
  });
}
