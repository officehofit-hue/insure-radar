"use client";

import { useState, useEffect } from "react";

interface FavoriteItem {
  id: string;
  type: "news" | "regulation" | "event" | "note";
  title: string;
  url?: string;
  addedAt: string;
}

const typeIcon = (type: FavoriteItem["type"]) => {
  switch (type) {
    case "news": return "📰";
    case "regulation": return "📜";
    case "event": return "📅";
    case "note": return "📝";
  }
};

const typeLabel = (type: FavoriteItem["type"]) => {
  switch (type) {
    case "news": return "חדשות";
    case "regulation": return "רגולציה";
    case "event": return "אירוע";
    case "note": return "הערה";
  }
};

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<FavoriteItem["type"]>("news");

  useEffect(() => {
    const saved = localStorage.getItem("insure-radar-favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const saveFavorites = (items: FavoriteItem[]) => {
    setFavorites(items);
    localStorage.setItem("insure-radar-favorites", JSON.stringify(items));
  };

  const addFavorite = () => {
    if (!newTitle.trim()) return;
    const item: FavoriteItem = {
      id: Date.now().toString(),
      type: newType,
      title: newTitle.trim(),
      url: newUrl.trim() || undefined,
      addedAt: new Date().toLocaleDateString("he-IL"),
    };
    saveFavorites([item, ...favorites]);
    setNewTitle("");
    setNewUrl("");
    setShowAdd(false);
  };

  const removeFavorite = (id: string) => {
    saveFavorites(favorites.filter((f) => f.id !== id));
  };

  return (
    <section id="favorites" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">&#x2B50; מועדפים</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-xl bg-accent-blue text-white text-sm font-medium hover:bg-accent-blue/90 transition-colors shadow-sm"
        >
          {showAdd ? "ביטול" : "+ הוסף"}
        </button>
      </div>

      {showAdd && (
        <div className="border border-card-border rounded-2xl bg-card-bg p-5 space-y-3 shadow-sm">
          <div className="flex gap-1.5 flex-wrap">
            {(["news", "regulation", "event", "note"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNewType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  newType === t
                    ? "bg-accent-blue text-white"
                    : "bg-section-bg text-text-muted"
                }`}
              >
                {typeIcon(t)} {typeLabel(t)}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="כותרת..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFavorite()}
            className="w-full px-4 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
          />
          <input
            type="url"
            placeholder="קישור (אופציונלי)..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFavorite()}
            className="w-full px-4 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
            dir="ltr"
          />
          <button
            onClick={addFavorite}
            className="px-6 py-2.5 rounded-xl bg-accent-green text-white text-sm font-medium hover:bg-accent-green/90 transition-colors"
          >
            שמור
          </button>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="border border-dashed border-card-border rounded-2xl p-10 text-center text-text-muted bg-card-bg">
          <p className="text-3xl mb-2">&#x2B50;</p>
          <p className="font-medium">עדיין אין מועדפים</p>
          <p className="text-sm mt-1">שמרו חדשות, חוזרים, אירועים או הערות חשובות</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="card-hover flex items-center justify-between border border-card-border rounded-2xl bg-card-bg p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{typeIcon(fav.type)}</span>
                <div>
                  {fav.url ? (
                    <a href={fav.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sm hover:text-accent transition-colors text-foreground">
                      {fav.title}
                    </a>
                  ) : (
                    <span className="font-medium text-sm text-foreground">{fav.title}</span>
                  )}
                  <p className="text-[11px] text-text-muted">
                    {typeLabel(fav.type)} &middot; {fav.addedAt}
                  </p>
                </div>
              </div>
              <button onClick={() => removeFavorite(fav.id)} className="text-text-muted hover:text-accent-red transition-colors" title="הסר">
                &#x2715;
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
