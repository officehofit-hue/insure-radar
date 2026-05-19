"use client";

import { useState } from "react";

const navItems = [
  { id: "markets", label: "מדדים", icon: "📊" },
  { id: "news", label: "חדשות", icon: "📰" },
  { id: "maya", label: "מאיה", icon: "🏦" },
  { id: "regulation", label: "רגולציה", icon: "📜" },
  { id: "weekly", label: "סיכום שבועי", icon: "📋" },
  { id: "calculator", label: "מחשבונים", icon: "🧮" },
  { id: "events", label: "אירועים", icon: "📅" },
  { id: "favorites", label: "מועדפים", icon: "⭐" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#faf8f4]/95 backdrop-blur-lg border-b border-card-border">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-blue to-[#2a4a7a] flex items-center justify-center text-base font-bold text-white shadow-lg shadow-accent-blue/20">
            IR
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight gold-gradient">InsureRadar</h1>
            <p className="text-[11px] text-text-muted">הדשבורד המקצועי לשוק הביטוח</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="px-2.5 py-1.5 rounded-lg text-[13px] text-text-muted hover:text-accent hover:bg-accent/5 transition-colors"
            >
              <span className="ml-1 text-xs">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-accent-green font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green pulse-dot"></span>
          LIVE
        </div>

        <button
          className="lg:hidden text-xl text-text-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-card-border bg-card-bg px-5 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="w-full text-right px-3 py-2.5 text-sm text-text-muted hover:text-accent border-b border-card-border/50 last:border-0 transition-colors"
            >
              <span className="ml-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
