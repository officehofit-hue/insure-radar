import { NextResponse } from "next/server";
import Parser from "rss-parser";

// Insurance companies with their Maya links
const INSURANCE_COMPANIES = [
  { names: ["מנורה", "מנורה מבטחים"], symbol: "MNRH", icon: "🔵", mayaLink: "https://maya.tase.co.il/he/company/572" },
  { names: ["הראל"], symbol: "HARL", icon: "🟢", mayaLink: "https://maya.tase.co.il/he/company/825" },
  { names: ["מגדל"], symbol: "MGDL", icon: "🟣", mayaLink: "https://maya.tase.co.il/he/company/604" },
  { names: ["כלל ביטוח"], symbol: "KLIL", icon: "🟠", mayaLink: "https://maya.tase.co.il/he/company/224" },
  { names: ["הפניקס", "פניקס"], symbol: "PHNX", icon: "🔴", mayaLink: "https://maya.tase.co.il/he/company/1041" },
  { names: ["איילון"], symbol: "AILN", icon: "🔷", mayaLink: "https://maya.tase.co.il/he/company/348" },
  { names: ["שומרה"], symbol: "SHMR", icon: "🟤", mayaLink: "https://maya.tase.co.il/he/company/1632" },
  { names: ["מיטב"], symbol: "MTDS", icon: "⚪", mayaLink: "https://maya.tase.co.il/he/company/1702" },
  { names: ["אלטשולר"], symbol: "ALTS", icon: "🔶", mayaLink: "https://maya.tase.co.il/he/company/1609" },
  { names: ["ביטוח ישיר", "ביטוח ישיר"], symbol: "DIRC", icon: "🟡", mayaLink: "https://maya.tase.co.il/he/company/1108" },
];

// Keywords that indicate a stock-exchange-related report
const REPORT_KEYWORDS = [
  "דוח כספי", "דוחות כספיים", "תוצאות כספיות", "רווח", "הפסד",
  "רבעון", "רבעוני", "שנתי", "דוח שנתי",
  "דיבידנד", "חלוקת דיבידנד",
  "הנפקה", "אג\"ח", "אגרות חוב", "תשקיף", "גיוס",
  "דירקטוריון", "מינוי", "התפטרות", "אסיפה כללית", "אסיפת בעלי מניות",
  "מיזוג", "רכישה", "עסקה", "בעל שליטה",
  "דיווח מיידי", "דיווח",
  "ביטוח", "פרמיות", "תביעות", "חיתום",
  "פנסי", "גמל", "תשואה", "דמי ניהול",
  "רשות שוק ההון", "רגולצי", "חוזר",
  "בורסה", "מניות", "מדד",
];

function findCompany(text: string) {
  for (const company of INSURANCE_COMPANIES) {
    for (const name of company.names) {
      if (text.includes(name)) return company;
    }
  }
  return null;
}

function isRelevant(title: string, snippet: string): boolean {
  const text = `${title} ${snippet}`;
  return REPORT_KEYWORDS.some((kw) => text.includes(kw));
}

function detectType(title: string, snippet: string): string {
  const text = `${title} ${snippet}`;
  if (/דוח כספי|דוחות כספיים|תוצאות כספיות|רבעון|שנתי/.test(text)) return "דוח כספי";
  if (/דיבידנד|חלוקת/.test(text)) return "דיבידנד";
  if (/הנפקה|אג"ח|אגרות חוב|תשקיף|גיוס/.test(text)) return "הנפקה";
  if (/מינוי|התפטר|דירקטוריון|אסיפ/.test(text)) return "ממשל תאגידי";
  if (/רכישה|מיזוג|עסקה/.test(text)) return "עסקה";
  if (/רשות שוק ההון|רגולצי|חוזר/.test(text)) return "רגולציה";
  if (/דיווח מיידי/.test(text)) return "דיווח מיידי";
  return "עדכון";
}

const feedSources = [
  { name: "גלובס", rssUrl: "https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=585", icon: "🟠" },
  { name: "גלובס", rssUrl: "https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iID=2", icon: "🟠" },
  { name: "דה מרקר", rssUrl: "https://www.themarker.com/cmlink/1.145", icon: "🟢" },
  { name: "כלכליסט", rssUrl: "https://www.calcalist.co.il/GeneralRSS/0,16335,L-8,00.xml", icon: "🔴" },
  { name: "ביזפורטל", rssUrl: "https://www.bizportal.co.il/rss/bizportalrss.xml", icon: "🟦" },
];

export async function GET() {
  const parser = new Parser({
    timeout: 8000,
    headers: { "User-Agent": "InsureRadar/1.0" },
  });

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

  const results: FeedItem[] = [];

  await Promise.allSettled(
    feedSources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.rssUrl);
        for (const item of (feed.items || []).slice(0, 15)) {
          if (!item.title) continue;

          const title = item.title.trim();
          const rawSnippet = item.contentSnippet || item.content || item.summary || "";
          const snippet = rawSnippet.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().slice(0, 200);

          // Must mention an insurance company OR be relevant to insurance/finance
          const company = findCompany(`${title} ${snippet}`);
          if (!company && !isRelevant(title, snippet)) continue;

          // If a specific company is found — great, link to their Maya page
          // If general insurance/finance news — link to general Maya reports
          results.push({
            company: company?.names[0] || "שוק הביטוח",
            companySymbol: company?.symbol || "TASE",
            companyIcon: company?.icon || "🏛️",
            mayaLink: company?.mayaLink || "https://maya.tase.co.il/he/reports/companies",
            title,
            snippet,
            source: source.name,
            sourceIcon: source.icon,
            pubDate: item.pubDate || item.isoDate || "",
            reportType: detectType(title, snippet),
            articleLink: item.link || "",
          });
        }
      } catch {
        // skip
      }
    })
  );

  // Sort newest first
  results.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Deduplicate
  const seen = new Set<string>();
  const unique = results.filter((item) => {
    const key = item.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({
    items: unique.slice(0, 10),
    total: unique.length,
  });
}
