import type { Metadata } from "next";
import TripDashboard from "./TripDashboard";

export const metadata: Metadata = {
  title: "הטיול לסלובקיה ואוסטריה | ניהול תקציב",
  description: "דשבורד לניהול הטיול והתקציב: תקציב מול הוצאות, מסלול יומי, הזמנות וצ'קליסט",
};

export default function TripPage() {
  return <TripDashboard />;
}
