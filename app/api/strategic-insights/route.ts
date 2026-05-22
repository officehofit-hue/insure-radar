import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const revalidate = 300;

interface StrategicSource {
  name: string;
  rssUrl: string;
  icon: string;
}

type InsightCategory = "הזדמנות" | "סיכון" | "מהלך תחרותי" | "מגמת שוק" | "רגולציה";

interface StrategicInsight {
  title: string;
  snippet: string;
  link: string;
  category: InsightCategory;
  source: string;
  sourceIcon: string;
  pubDate: string;
  mentionsMenora: boolean;
  mentionsCompetitor: boolean;
  competitorName: string;
}

const sources: StrategicSource[] = [
  {
    name: "גלובס ביטוח",
    rssUrl: "https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=585",
    icon: "🟠",
  },
  {
    name: "גלובס שוק ההון",
    rssUrl: "https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=2",
    icon: "🟠",
  },
  {
    name: "דה מרקר",
    rssUrl: "https://www.themarker.com/cmlink/1.145",
    icon: "🟢",
  },
  {
    name: "כלכליסט",
    rssUrl: "https://www.calcalist.co.il/GeneralRSS/0,16335,L-8,00.xml",
    icon: "🔴",
  },
];

// Strategic keyword groups
const STRATEGIC_KEYWORDS: Record<string, string[]> = {
  ma: ["רכישה", "מיזוג", "עסקה", "השתלטות", "מכירה"],
  executive: ["מינוי", 'מנכ"ל', 'יו"ר', "דירקטוריון", "התפטר", "פיטורים"],
  financial: ["דיבידנד", "הנפקה", "גיוס הון", "רווח שיא", "הפסד", "דוחות כספיים", "רבעון"],
  regulatory: ["חוזר חדש", "רשות שוק ההון", "סנקציה", "עיצום", "רגולציה"],
  market: ["שוק ההון", "טכנולוגיה", "InsurTech", "אינשורטק", "חדשנות", "דיגיטלי"],
};

const MENORA_EXACT = ["מנורה מבטחים", "מנורה מבטחים החזקות"];
const MENORA_FUZZY = ["מנורה"];

/* Exact (unambiguous) competitor names — match directly */
const COMPETITOR_EXACT: Record<string, string[]> = {
  הראל: ["הראל ביטוח", "הראל פיננסים", "קבוצת הראל"],
  מגדל: ["מגדל ביטוח", "מגדל שוקי הון", "קבוצת מגדל"],
  כלל: ["כלל ביטוח", "כלל חברה לביטוח", "כלל החזקות"],
  הפניקס: ["הפניקס ביטוח", "הפניקס החזקות", "קבוצת הפניקס"],
  איילון: ["איילון ביטוח", "איילון החזקות"],
  שומרה: ["שומרה ביטוח"],
  "הכשרת הישוב": ["הכשרת הישוב"],
};

/* Fuzzy (ambiguous) competitor names — need insurance context */
const COMPETITOR_FUZZY: Record<string, string[]> = {
  הראל: ["הראל"],
  מגדל: ["מגדל"],
  הפניקס: ["הפניקס", "פניקס"],
  איילון: ["איילון"],
  שומרה: ["שומרה"],
};

/* Insurance context words for confirming fuzzy matches */
const INSURANCE_CONTEXT_WORDS = [
  "ביטוח", "מבטחים", "פוליס", "פרמי", "תביע", "חיתום",
  "פנסי", "גמל", "בורסה", "מניות", "שוק ההון", "דיבידנד",
  "דוח כספי", "דוחות כספיים", "רבעון",
  "חברת ביטוח", "חברות ביטוח", "ענף הביטוח",
  "רשות שוק ההון",
];

function isStrategic(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [group, keywords] of Object.entries(STRATEGIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) return group;
    }
  }
  return null;
}

function classifyCategory(text: string, group: string): InsightCategory {
  const lower = text.toLowerCase();

  // Regulatory signals
  if (group === "regulatory" || lower.includes("רגולציה") || lower.includes("רשות שוק ההון") || lower.includes("חוזר חדש") || lower.includes("סנקציה") || lower.includes("עיצום")) {
    return "רגולציה";
  }

  // Risk signals
  if (lower.includes("הפסד") || lower.includes("סנקציה") || lower.includes("עיצום") || lower.includes("פיטורים") || lower.includes("התפטר")) {
    return "סיכון";
  }

  // Competitor moves
  if (group === "ma" || group === "executive") {
    // Check if it mentions a competitor
    for (const names of Object.values(COMPETITOR_EXACT)) {
      if (names.some((n) => lower.includes(n.toLowerCase()))) {
        return "מהלך תחרותי";
      }
    }
    for (const names of Object.values(COMPETITOR_FUZZY)) {
      if (names.some((n) => lower.includes(n.toLowerCase()))) {
        return "מהלך תחרותי";
      }
    }
  }

  // Opportunity signals
  if (lower.includes("רווח שיא") || lower.includes("דיבידנד") || lower.includes("הנפקה") || lower.includes("גיוס הון") || group === "ma") {
    return "הזדמנות";
  }

  // Market trends
  if (group === "market" || group === "financial") {
    return "מגמת שוק";
  }

  return "מגמת שוק";
}

function detectMenora(text: string): boolean {
  // Exact match first
  if (MENORA_EXACT.some((t) => text.includes(t))) return true;
  // Fuzzy: only with insurance context
  if (MENORA_FUZZY.some((t) => text.includes(t))) {
    return INSURANCE_CONTEXT_WORDS.some((kw) => text.includes(kw));
  }
  return false;
}

function detectCompetitor(text: string): { found: boolean; name: string } {
  // Pass 1: exact names
  for (const [name, variants] of Object.entries(COMPETITOR_EXACT)) {
    if (variants.some((v) => text.includes(v))) {
      return { found: true, name };
    }
  }
  // Pass 2: fuzzy names — only with insurance context
  const hasContext = INSURANCE_CONTEXT_WORDS.some((kw) => text.includes(kw));
  if (!hasContext) return { found: false, name: "" };
  for (const [name, variants] of Object.entries(COMPETITOR_FUZZY)) {
    if (variants.some((v) => text.includes(v))) {
      return { found: true, name };
    }
  }
  return { found: false, name: "" };
}

export async function GET() {
  const parser = new Parser({
    timeout: 8000,
    headers: {
      "User-Agent": "InsureRadar/1.0",
    },
  });

  const allInsights: StrategicInsight[] = [];

  await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.rssUrl);
        const items = (feed.items || []).slice(0, 15);

        for (const item of items) {
          if (!item.title) continue;

          const rawSnippet =
            item.contentSnippet || item.content || item.summary || "";
          const snippet = rawSnippet
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim()
            .slice(0, 200);

          const title = item.title.trim();
          const fullText = `${title} ${snippet}`;

          const strategicGroup = isStrategic(fullText);
          if (!strategicGroup) continue;

          const category = classifyCategory(fullText, strategicGroup);
          const mentionsMenora = detectMenora(fullText);
          const competitor = detectCompetitor(fullText);

          allInsights.push({
            title,
            snippet,
            link: item.link || "",
            category,
            source: source.name,
            sourceIcon: source.icon,
            pubDate: item.pubDate || item.isoDate || "",
            mentionsMenora,
            mentionsCompetitor: competitor.found,
            competitorName: competitor.name,
          });
        }
      } catch {
        // Source unavailable, skip
      }
    })
  );

  // Sort by date (newest first)
  allInsights.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  // Return top 5 most strategic items
  const top5 = allInsights.slice(0, 5);

  return NextResponse.json({ insights: top5 });
}
