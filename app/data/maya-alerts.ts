export interface MayaAlert {
  id: string;
  company: string;
  companySymbol: string;
  icon: string;
  title: string;
  desc: string;
  date: string; // DD.MM.YYYY
  time: string; // HH:MM
  type: "דוח כספי" | "דיווח מיידי" | "הודעה" | "אסיפה" | "הנפקה" | "אחר";
  mayaLink: string;
}

// ===================================================
//  כדי להוסיף התראה חדשה — פשוט תוסיפי שורה למערך!
//  כל התראה מופיעה כקישור ישיר לאתר מאיה
// ===================================================
export const mayaAlerts: MayaAlert[] = [
  {
    id: "1",
    company: "מנורה מבטחים",
    companySymbol: "MNRH",
    icon: "🔵",
    title: "מנורה מבטחים פרסמו את הדוחות הכספיים ל-Q1 2026",
    desc: "דוח כספי רבעוני ראשון לשנת 2026 — כולל נתוני רווח והפסד, מאזן ותזרים מזומנים",
    date: "18.05.2026",
    time: "20:15",
    type: "דוח כספי",
    mayaLink: "https://maya.tase.co.il/he/company/572",
  },
  {
    id: "2",
    company: "הפניקס",
    companySymbol: "PHNX",
    icon: "🔴",
    title: "הפניקס — דיווח מיידי על חלוקת דיבידנד",
    desc: "הודעה על חלוקת דיבידנד לבעלי המניות בסך 1.2 מיליארד שקל",
    date: "18.05.2026",
    time: "17:30",
    type: "דיווח מיידי",
    mayaLink: "https://maya.tase.co.il/he/company/1041",
  },
  {
    id: "3",
    company: "מגדל ביטוח",
    companySymbol: "MGDL",
    icon: "🟣",
    title: "מגדל ביטוח — דוחות כספיים Q1 2026",
    desc: "תוצאות הרבעון הראשון: עלייה ברווח הנקי, גידול בפרמיות ביטוח כללי",
    date: "17.05.2026",
    time: "21:00",
    type: "דוח כספי",
    mayaLink: "https://maya.tase.co.il/he/company/604",
  },
  {
    id: "4",
    company: "הראל ביטוח",
    companySymbol: "HARL",
    icon: "🟢",
    title: "הראל — דיווח מיידי: מינוי סמנכ״ל כספים חדש",
    desc: "הראל ביטוח ופיננסים מודיעה על מינוי סמנכ״ל כספים חדש לקבוצה",
    date: "15.05.2026",
    time: "09:45",
    type: "דיווח מיידי",
    mayaLink: "https://maya.tase.co.il/he/company/825",
  },
  {
    id: "5",
    company: "כלל ביטוח",
    companySymbol: "KLIL",
    icon: "🟠",
    title: "כלל ביטוח — זימון אסיפה כללית מיוחדת",
    desc: "זימון אסיפה כללית מיוחדת של בעלי המניות לאישור עסקה עם בעל שליטה",
    date: "14.05.2026",
    time: "16:20",
    type: "אסיפה",
    mayaLink: "https://maya.tase.co.il/he/company/224",
  },
  {
    id: "6",
    company: "מנורה מבטחים",
    companySymbol: "MNRH",
    icon: "🔵",
    title: "מנורה — הנפקת אג״ח סדרה חדשה",
    desc: "מנורה מבטחים הודיעה על הנפקת סדרת אגרות חוב חדשה בהיקף 800 מיליון שקל",
    date: "12.05.2026",
    time: "11:00",
    type: "הנפקה",
    mayaLink: "https://maya.tase.co.il/he/company/572",
  },
];
