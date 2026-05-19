import Header from "./components/Header";
import DailyTip from "./components/DailyTip";
import MarketDashboard from "./components/MarketDashboard";
import News from "./components/News";
import MayaReports from "./components/MayaReports";
import Regulation from "./components/Regulation";
import WeeklySummary from "./components/WeeklySummary";
import Calculator from "./components/Calculator";
import EventsCalendar from "./components/EventsCalendar";
import Favorites from "./components/Favorites";

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-5 py-8 space-y-12">
        <DailyTip />
        <MarketDashboard />
        <News />
        <MayaReports />
        <Regulation />
        <WeeklySummary />
        <Calculator />
        <EventsCalendar />
        <Favorites />
      </main>
      <footer className="border-t border-card-border py-5 mt-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between text-xs text-text-muted gap-2">
          <p>InsureRadar &copy; {new Date().getFullYear()} &middot; המידע המקצועי שלך, במקום אחד</p>
          <p>
            נתוני שוק באדיבות{" "}
            <a
              href="https://www.tradingview.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              TradingView
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
