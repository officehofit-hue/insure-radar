"use client";

import { useState } from "react";

interface CalendarEvent {
  title: string;
  date: string;
  type: "conference" | "deadline" | "report" | "regulation";
  description: string;
}

const typeConfig: Record<CalendarEvent["type"], { label: string; color: string; icon: string }> = {
  conference: { label: "כנס", color: "bg-accent/10 text-accent border-accent/30", icon: "🎤" },
  deadline: { label: "דדליין", color: "bg-accent-red/10 text-accent-red border-accent-red/30", icon: "⏰" },
  report: { label: "דיווח", color: "bg-accent-blue/10 text-accent-blue border-accent-blue/30", icon: "📊" },
  regulation: { label: "רגולציה", color: "bg-violet-600/10 text-violet-700 border-violet-700/30", icon: "📜" },
};

const events: CalendarEvent[] = [
  {
    title: "כנס ביטוח שנתי — איגוד חברות הביטוח",
    date: "2026-06-15",
    type: "conference",
    description: "הכנס השנתי של איגוד חברות הביטוח בישראל. נושא מרכזי: AI בחיתום ותביעות.",
  },
  {
    title: "מועד אחרון — דוחות כספיים Q1",
    date: "2026-05-31",
    type: "deadline",
    description: "מועד אחרון להגשת דוחות כספיים רבעוניים (Q1 2026) לרשות שוק ההון.",
  },
  {
    title: "פרסום דוח שנתי — רשות שוק ההון",
    date: "2026-06-01",
    type: "report",
    description: "רשות שוק ההון מפרסמת את הדוח השנתי על מצב שוק הביטוח והחיסכון הפנסיוני.",
  },
  {
    title: "כנס InsureTech Israel",
    date: "2026-06-22",
    type: "conference",
    description: "כנס הטכנולוגיה של תעשיית הביטוח. סטארטאפים, חדשנות ודיגיטציה.",
  },
  {
    title: "תחילת תוקף — תקנות שקיפות דמי ניהול",
    date: "2026-07-01",
    type: "regulation",
    description: "התקנות החדשות לשקיפות דמי ניהול בקרנות פנסיה נכנסות לתוקף.",
  },
  {
    title: "מועד אחרון — דיווח שנתי ביטוח משנה",
    date: "2026-06-30",
    type: "deadline",
    description: "מועד אחרון להגשת דיווח שנתי על הסכמי ביטוח משנה לרשות שוק ההון.",
  },
  {
    title: "פרסום תשואות קרנות פנסיה — חצי שנתי",
    date: "2026-07-15",
    type: "report",
    description: "גמל-נט מפרסם את נתוני התשואות המעודכנים של כל קרנות הפנסיה למחצית הראשונה.",
  },
  {
    title: "כנס הפנסיה השנתי",
    date: "2026-09-10",
    type: "conference",
    description: "כנס מקצועי בנושא חידושים בפנסיה, קופות גמל ותכנון פרישה.",
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function EventsCalendar() {
  const [filter, setFilter] = useState<CalendarEvent["type"] | "all">("all");

  const filtered = (filter === "all" ? events : events.filter((e) => e.type === filter))
    .filter((e) => daysUntil(e.date) >= -1)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section id="events" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold">&#x1F4C5; לוח אירועים</h2>
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
          {(Object.keys(typeConfig) as CalendarEvent["type"][]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === type
                  ? "bg-accent-blue text-white shadow-sm"
                  : "bg-section-bg text-text-muted hover:text-foreground"
              }`}
            >
              {typeConfig[type].icon} {typeConfig[type].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((event, i) => {
          const days = daysUntil(event.date);
          const isUrgent = days <= 7 && days >= 0;
          const isPast = days < 0;

          return (
            <div
              key={i}
              className={`card-hover border rounded-xl bg-card-bg p-5 transition-all ${
                isUrgent ? "border-accent/50" : "border-card-border"
              } ${isPast ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${typeConfig[event.type].color}`}>
                      {typeConfig[event.type].icon} {typeConfig[event.type].label}
                    </span>
                    {isUrgent && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-accent-red/15 text-accent-red">
                        בקרוב!
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm leading-snug mb-1 text-foreground">
                    {event.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <div className="text-left min-w-[90px]">
                  <p className="text-xs text-text-muted">{formatDate(event.date)}</p>
                  <p className={`text-lg font-bold mt-1 ${
                    isUrgent ? "text-accent-red" : days >= 0 ? "text-accent" : "text-text-muted"
                  }`}>
                    {days === 0 ? "היום!" : days > 0 ? `${days} ימים` : "עבר"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="border border-dashed border-card-border rounded-2xl p-10 text-center text-text-muted bg-card-bg">
          <p className="text-3xl mb-2">&#x1F4C5;</p>
          <p className="font-medium">אין אירועים בקטגוריה זו</p>
        </div>
      )}
    </section>
  );
}
