"use client";

import { useState } from "react";

interface RegItem {
  title: string;
  date: string;
  type: "circular" | "regulation" | "enforcement" | "update";
  body: string;
  source: string;
}

const typeConfig: Record<RegItem["type"], { label: string; color: string }> = {
  circular: { label: "חוזר", color: "bg-accent/10 text-accent" },
  regulation: { label: "תקנה", color: "bg-violet-600/10 text-violet-700" },
  enforcement: { label: "אכיפה", color: "bg-red-600/10 text-red-700" },
  update: { label: "עדכון", color: "bg-accent-blue/10 text-accent-blue" },
};

const regulations: RegItem[] = [
  {
    title: "עדכון הוראות ניהול סיכונים בגופים מוסדיים",
    date: "2026-05-18",
    type: "circular",
    body: "רשות שוק ההון פרסמה חוזר מעודכן בנושא ניהול סיכונים, הכולל דרישות חדשות לדיווח ובקרה פנימית.",
    source: "רשות שוק ההון",
  },
  {
    title: "תקנות חדשות לשקיפות דמי ניהול בקרנות פנסיה",
    date: "2026-05-15",
    type: "regulation",
    body: "תקנות חדשות מחייבות את קרנות הפנסיה להציג דמי ניהול בצורה אחידה ושקופה, כולל השוואה למדד ענפי.",
    source: "רשות שוק ההון",
  },
  {
    title: "קנס למגדל ביטוח בגין עיכוב בטיפול בתביעות",
    date: "2026-05-12",
    type: "enforcement",
    body: "הממונה על רשות שוק ההון הטיל עיצום כספי על מגדל בגין עיכוב שיטתי בטיפול בתביעות ביטוח בריאות.",
    source: "רשות שוק ההון",
  },
  {
    title: "הנחיות חדשות לביטוח סייבר לעסקים",
    date: "2026-05-10",
    type: "circular",
    body: "חוזר חדש מגדיר סטנדרטים מינימליים לפוליסות ביטוח סייבר, כולל דרישות גילוי ותנאי כיסוי אחידים.",
    source: "רשות שוק ההון",
  },
  {
    title: "עדכון תקרות הפקדה לקופות גמל להשקעה",
    date: "2026-05-08",
    type: "update",
    body: "עדכון שנתי של תקרות ההפקדה לקופות גמל להשקעה בהתאם למדד המחירים לצרכן.",
    source: "רשות המיסים",
  },
  {
    title: "דרישות הון מינימלי מעודכנות לחברות ביטוח",
    date: "2026-05-05",
    type: "regulation",
    body: "רשות שוק ההון פרסמה דרישות הון מעודכנות (Solvency II) שיחולו מתחילת 2027.",
    source: "רשות שוק ההון",
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Regulation() {
  const [filter, setFilter] = useState<RegItem["type"] | "all">("all");

  const filtered = filter === "all" ? regulations : regulations.filter((r) => r.type === filter);

  return (
    <section id="regulation" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold">&#x1F4DC; רגולציה וחוזרים</h2>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-accent-blue text-white shadow-sm"
                : "bg-section-bg text-text-muted hover:text-foreground"
            }`}
          >
            הכל
          </button>
          {(Object.keys(typeConfig) as RegItem["type"][]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === type
                  ? "bg-accent-blue text-white shadow-sm"
                  : "bg-section-bg text-text-muted hover:text-foreground"
              }`}
            >
              {typeConfig[type].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item, i) => (
          <div
            key={i}
            className="card-hover border border-card-border rounded-xl bg-card-bg p-5 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typeConfig[item.type].color}`}
                >
                  {typeConfig[item.type].label}
                </span>
                <span className="text-xs text-text-muted">{item.source}</span>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {formatDate(item.date)}
              </span>
            </div>
            <h3 className="font-bold text-sm leading-snug mb-2 text-foreground">
              {item.title}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted text-center">
        מקור: רשות שוק ההון, ביטוח וחיסכון &middot; רשות המיסים
      </p>
    </section>
  );
}
