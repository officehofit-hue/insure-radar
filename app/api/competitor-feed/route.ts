import Parser from "rss-parser";
import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  Cache revalidation – refresh every 5 minutes                      */
/* ------------------------------------------------------------------ */
export const revalidate = 300;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Competitor {
  names: string[];
  symbol: string;
  icon: string;
  mayaLink: string;
}

type EventType = "דוח כספי" | "מינוי" | "דיבידנד" | "M&A" | "רגולציה" | "כללי";

interface FeedItem {
  competitor: string;
  icon: string;
  symbol: string;
  mayaLink: string;
  title: string;
  snippet: string;
  source: string;
  sourceIcon: string;
  pubDate: string;
  eventType: EventType;
  articleLink: string;
}

/* ------------------------------------------------------------------ */
/*  Competitors (everyone except Menora)                               */
/* ------------------------------------------------------------------ */
const COMPETITORS: Competitor[] = [
  {
    names: ["הראל", "הראל ביטוח"],
    symbol: "HARL",
    icon: "🟢",
    mayaLink: "https://maya.tase.co.il/he/company/825",
  },
  {
    names: ["מגדל", "מגדל ביטוח"],
    symbol: "MGDL",
    icon: "🟣",
    mayaLink: "https://maya.tase.co.il/he/company/604",
  },
  {
    names: ["כלל ביטוח"],
    symbol: "CLIS",
    icon: "🟠",
    mayaLink: "https://maya.tase.co.il/he/company/224",
  },
  {
    names: ["הפניקס", "פניקס"],
    symbol: "PHOE",
    icon: "🔴",
    mayaLink: "https://maya.tase.co.il/he/company/1041",
  },
  {
    names: ["איילון"],
    symbol: "AILN",
    icon: "🔷",
    mayaLink: "https://maya.tase.co.il/he/company/348",
  },
  {
    names: ["שומרה"],
    symbol: "SHMR",
    icon: "🟤",
    mayaLink: "https://maya.tase.co.il/he/company/1632",
  },
  {
    names: ["מיטב"],
    symbol: "MTDS",
    icon: "⚪",
    mayaLink: "https://maya.tase.co.il/he/company/1702",
  },
  {
    names: ["אלטשולר"],
    symbol: "ALTS",
    icon: "🔶",
    mayaLink: "https://maya.tase.co.il/he/company/1609",
  },
  {
    names: ["ביטוח ישיר"],
    symbol: "DIRC",
    icon: "🟡",
    mayaLink: "https://maya.tase.co.il/he/company/1108",
  },
];

/* ------------------------------------------------------------------ */
/*  RSS feed sources                                                   */
/* ------------------------------------------------------------------ */
interface FeedSource {
  url: string;
  name: string;
  icon: string;
}

const FEEDS: FeedSource[] = [
  {
    url: "https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=585",
    name: "גלובס ביטוח",
    icon: "🟠",
  },
  {
    url: "https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=2",
    name: "גלובס שוק ההון",
    icon: "🟠",
  },
  {
    url: "https://www.themarker.com/cmlink/1.145",
    name: "דה מרקר",
    icon: "🔵",
  },
  {
    url: "https://www.calcalist.co.il/GeneralRSS/0,16335,L-8,00.xml",
    name: "כלכליסט",
    icon: "🔴",
  },
  {
    url: "https://www.bizportal.co.il/rss/bizportalrss.xml",
    name: "ביזפורטל",
    icon: "🟣",
  },
];

/* ------------------------------------------------------------------ */
/*  Event type classification                                          */
/* ------------------------------------------------------------------ */
const EVENT_PATTERNS: { type: EventType; keywords: string[] }[] = [
  {
    type: "דוח כספי",
    keywords: [
      "דוח כספי",
      "דוחות כספיים",
      "תוצאות כספיות",
      "רבעון",
      "רווח",
      "הפסד",
      "הכנסות",
      "דוח שנתי",
      "מאזן",
      "דוח רבעוני",
    ],
  },
  {
    type: "מינוי",
    keywords: [
      "מינוי",
      "מונה",
      "מונתה",
      "מנכ\"ל",
      "יו\"ר",
      "דירקטור",
      "סמנכ\"ל",
      "התמנה",
      "התמנתה",
      "עזיבה",
      "פרישה",
    ],
  },
  {
    type: "דיבידנד",
    keywords: ["דיבידנד", "חלוקת רווחים", "חלוקה לבעלי מניות"],
  },
  {
    type: "M&A",
    keywords: [
      "רכישה",
      "מיזוג",
      "השתלטות",
      "הצעת רכש",
      "מכירת אחזקות",
      "רוכשת",
      "נרכשת",
      "עסקה",
      "הסכם רכישה",
    ],
  },
  {
    type: "רגולציה",
    keywords: [
      "רגולציה",
      "פיקוח",
      "רשות שוק ההון",
      "הממונה על שוק ההון",
      "תקנות",
      "רפורמה",
      "סנקציה",
      "אכיפה",
      "הנחיה",
    ],
  },
];

function classifyEvent(text: string): EventType {
  const lower = text.toLowerCase();
  for (const { type, keywords } of EVENT_PATTERNS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return type;
    }
  }
  return "כללי";
}

/* ------------------------------------------------------------------ */
/*  Match article text to a competitor                                 */
/* ------------------------------------------------------------------ */
function findCompetitor(
  text: string
): { name: string; symbol: string; icon: string; mayaLink: string } | null {
  for (const c of COMPETITORS) {
    for (const name of c.names) {
      if (text.includes(name)) {
        return { name: c.names[0], symbol: c.symbol, icon: c.icon, mayaLink: c.mayaLink };
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Strip HTML tags and trim to a snippet                              */
/* ------------------------------------------------------------------ */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function toSnippet(text: string, maxLen = 160): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

/* ------------------------------------------------------------------ */
/*  GET handler                                                        */
/* ------------------------------------------------------------------ */
export async function GET() {
  const parser = new Parser({
    timeout: 8000,
    headers: {
      "User-Agent": "InsureRadar/1.0",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  const items: FeedItem[] = [];

  const feedPromises = FEEDS.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const feedItems: FeedItem[] = [];

      for (const entry of feed.items ?? []) {
        const title = entry.title ?? "";
        const content = entry.contentSnippet ?? entry.content ?? entry.summary ?? "";
        const combined = `${title} ${content}`;

        const match = findCompetitor(combined);
        if (!match) continue;

        feedItems.push({
          competitor: match.name,
          icon: match.icon,
          symbol: match.symbol,
          mayaLink: match.mayaLink,
          title: stripHtml(title),
          snippet: toSnippet(content),
          source: source.name,
          sourceIcon: source.icon,
          pubDate: entry.pubDate ?? entry.isoDate ?? new Date().toISOString(),
          eventType: classifyEvent(combined),
          articleLink: entry.link ?? "",
        });
      }

      return feedItems;
    } catch (err) {
      console.error(`[competitor-feed] Failed to fetch ${source.name}:`, err);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);

  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }

  // Sort by date descending, return up to 12
  items.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return NextResponse.json({
    items: items.slice(0, 12),
    competitors: COMPETITORS.map((c) => ({
      name: c.names[0],
      symbol: c.symbol,
      icon: c.icon,
      mayaLink: c.mayaLink,
    })),
    updatedAt: new Date().toISOString(),
  });
}
