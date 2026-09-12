import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // כתובות קצרות וקליטות לדשבורד הטיול. הכתובת נשארת בשורת הכתובת, התוכן מגיע מ-/trip
    return ["/eurotrip", "/bratislava", "/vienna", "/2027"].map((source) => ({
      source,
      destination: "/trip",
    }));
  },
};

export default nextConfig;
