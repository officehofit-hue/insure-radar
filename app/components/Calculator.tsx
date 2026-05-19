"use client";

import { useState } from "react";

type CalcMode = "pension" | "life" | "savings" | "compare";

function formatCurrency(n: number): string {
  return n.toLocaleString("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  });
}

function PensionCalc() {
  const [salary, setSalary] = useState(15000);
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(67);
  const [rate, setRate] = useState(5);
  const [mgmtFee, setMgmtFee] = useState(1.5);

  const years = retireAge - age;
  const monthlyDeposit = salary * 0.186;
  const effectiveRate = (rate - mgmtFee) / 100 / 12;
  const months = years * 12;
  const total =
    monthlyDeposit * ((Math.pow(1 + effectiveRate, months) - 1) / effectiveRate);
  const totalDeposited = monthlyDeposit * months;
  const monthlyPension = total / (12 * 20);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">שכר ברוטו (&#8362;)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">גיל נוכחי</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">גיל פרישה</label>
          <input
            type="number"
            value={retireAge}
            onChange={(e) => setRetireAge(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">תשואה שנתית (%)</label>
          <input
            type="number"
            value={rate}
            step={0.5}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">דמי ניהול (%)</label>
          <input
            type="number"
            value={mgmtFee}
            step={0.1}
            onChange={(e) => setMgmtFee(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
            dir="ltr"
          />
        </div>
      </div>

      <div className="bg-gradient-to-bl from-accent/5 to-accent-blue/5 rounded-2xl p-5 space-y-3 border border-card-border">
        <div className="text-center">
          <p className="text-xs text-text-muted mb-1">צבירה צפויה בגיל {retireAge}</p>
          <p className="text-3xl font-bold text-accent">{formatCurrency(total)}</p>
        </div>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-text-muted text-xs">הפקדה חודשית</p>
            <p className="font-semibold text-foreground">{formatCurrency(monthlyDeposit)}</p>
          </div>
          <div className="text-center">
            <p className="text-text-muted text-xs">פנסיה חודשית משוערת</p>
            <p className="font-semibold text-accent-green">{formatCurrency(monthlyPension)}</p>
          </div>
          <div className="text-center">
            <p className="text-text-muted text-xs">סה&quot;כ הופקד</p>
            <p className="font-semibold text-foreground">{formatCurrency(totalDeposited)}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex rounded-full overflow-hidden h-3">
            <div className="bg-accent/40" style={{ width: `${(totalDeposited / total) * 100}%` }} />
            <div className="bg-accent-green/60" style={{ width: `${((total - totalDeposited) / total) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>&#x1F7E1; הפקדות</span>
            <span>&#x1F7E2; רווח מתשואה</span>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-text-muted text-center">* החישוב הוא הערכה כללית בלבד ואינו מהווה ייעוץ פנסיוני</p>
    </div>
  );
}

function LifeInsuranceCalc() {
  const [age, setAge] = useState(35);
  const [coverage, setCoverage] = useState(1000000);
  const [term, setTerm] = useState(20);
  const [smoker, setSmoker] = useState(false);

  const baseRate = smoker ? 0.0025 : 0.0012;
  const ageFactor = 1 + (age - 25) * 0.035;
  const monthlyPremium = (coverage * baseRate * ageFactor) / 12;
  const totalCost = monthlyPremium * term * 12;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">גיל</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">סכום כיסוי (&#8362;)</label>
          <input
            type="number"
            value={coverage}
            onChange={(e) => setCoverage(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">תקופה (שנים)</label>
          <input
            type="number"
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">מעשן/ת?</label>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setSmoker(false)}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                !smoker ? "bg-accent-green text-white" : "bg-section-bg text-text-muted border border-card-border"
              }`}
            >
              לא
            </button>
            <button
              onClick={() => setSmoker(true)}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                smoker ? "bg-accent-red text-white" : "bg-section-bg text-text-muted border border-card-border"
              }`}
            >
              כן
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-bl from-accent/5 to-violet-500/5 rounded-2xl p-5 text-center space-y-2 border border-card-border">
        <p className="text-xs text-text-muted">פרמיה חודשית משוערת</p>
        <p className="text-3xl font-bold text-accent">{formatCurrency(monthlyPremium)}</p>
        <p className="text-xs text-text-muted">
          כיסוי של {formatCurrency(coverage)} לתקופה של {term} שנים
        </p>
        <p className="text-xs text-text-muted">
          עלות כוללת לאורך התקופה: {formatCurrency(totalCost)}
        </p>
      </div>
      <p className="text-[10px] text-text-muted text-center">* החישוב הוא הערכה כללית. הפרמיה בפועל תלויה בבריאות, מצב רפואי ותנאי הפוליסה</p>
    </div>
  );
}

function SavingsCalc() {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(1000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  const futureInitial = initial * Math.pow(1 + monthlyRate, months);
  const futureMonthly = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  const total = futureInitial + futureMonthly;
  const totalInvested = initial + monthly * months;
  const profit = total - totalInvested;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">השקעה ראשונית (&#8362;)</label>
          <input type="number" value={initial} onChange={(e) => setInitial(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">הפקדה חודשית (&#8362;)</label>
          <input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">תשואה שנתית (%)</label>
          <input type="number" value={rate} step={0.5} onChange={(e) => setRate(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">תקופה (שנים)</label>
          <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground" dir="ltr" />
        </div>
      </div>

      <div className="bg-gradient-to-bl from-accent/5 to-accent-green/5 rounded-2xl p-5 space-y-3 border border-card-border">
        <div className="text-center">
          <p className="text-xs text-text-muted mb-1">הסכום שיצטבר אחרי {years} שנים</p>
          <p className="text-3xl font-bold text-accent">{formatCurrency(total)}</p>
        </div>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-text-muted text-xs">סה&quot;כ הושקע</p>
            <p className="font-semibold text-foreground">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="text-center">
            <p className="text-text-muted text-xs">רווח נקי</p>
            <p className="font-semibold text-accent-green">{formatCurrency(profit)}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex rounded-full overflow-hidden h-3">
            <div className="bg-accent/40" style={{ width: `${(totalInvested / total) * 100}%` }} />
            <div className="bg-accent-green/60" style={{ width: `${(profit / total) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>&#x1F7E1; הפקדות</span>
            <span>&#x1F7E2; רווח מריבית דריבית</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareCalc() {
  const [amount, setAmount] = useState(1000);
  const [years, setYears] = useState(20);
  const [feeA, setFeeA] = useState(1.5);
  const [feeB, setFeeB] = useState(0.5);

  const rate = 6;

  const calc = (fee: number) => {
    const effectiveRate = (rate - fee) / 100 / 12;
    const months = years * 12;
    return amount * ((Math.pow(1 + effectiveRate, months) - 1) / effectiveRate);
  };

  const totalA = calc(feeA);
  const totalB = calc(feeB);
  const diff = Math.abs(totalB - totalA);

  return (
    <div className="space-y-5">
      <p className="text-xs text-text-muted">השוואת השפעת דמי ניהול על החיסכון (בהנחת תשואה שנתית של {rate}%)</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">הפקדה חודשית (&#8362;)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">תקופה (שנים)</label>
          <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-section-bg border border-card-border text-sm text-foreground" dir="ltr" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent-red/10 rounded-2xl p-4 text-center border border-accent-red/20">
          <label className="block text-xs text-text-muted mb-1">דמי ניהול גבוהים (%)</label>
          <input type="number" value={feeA} step={0.1} onChange={(e) => setFeeA(Number(e.target.value))} className="w-20 mx-auto px-2 py-1 rounded-lg bg-section-bg border border-card-border text-sm text-center text-foreground" dir="ltr" />
          <p className="text-xl font-bold text-accent-red mt-2">{formatCurrency(totalA)}</p>
        </div>
        <div className="bg-accent-green/10 rounded-2xl p-4 text-center border border-accent-green/20">
          <label className="block text-xs text-text-muted mb-1">דמי ניהול נמוכים (%)</label>
          <input type="number" value={feeB} step={0.1} onChange={(e) => setFeeB(Number(e.target.value))} className="w-20 mx-auto px-2 py-1 rounded-lg bg-section-bg border border-card-border text-sm text-center text-foreground" dir="ltr" />
          <p className="text-xl font-bold text-accent-green mt-2">{formatCurrency(totalB)}</p>
        </div>
      </div>

      <div className="text-center text-sm text-text-muted">
        הפרש של{" "}
        <span className="font-bold text-accent">{formatCurrency(diff)}</span>{" "}
        על הפקדה חודשית של {formatCurrency(amount)} לאורך {years} שנים
      </div>
    </div>
  );
}

export default function Calculator() {
  const [mode, setMode] = useState<CalcMode>("pension");

  const modes: { key: CalcMode; label: string; icon: string }[] = [
    { key: "pension", label: "פנסיה", icon: "&#x1F3E6;" },
    { key: "life", label: "ביטוח חיים", icon: "&#x1F6E1;" },
    { key: "savings", label: "חיסכון", icon: "&#x1F4B0;" },
    { key: "compare", label: "השוואת דמי ניהול", icon: "&#x2696;" },
  ];

  return (
    <section id="calculator" className="space-y-4">
      <h2 className="text-xl font-bold">&#x1F9EE; מחשבונים מקצועיים</h2>

      <div className="border border-card-border rounded-2xl bg-card-bg shadow-sm overflow-hidden">
        <div className="flex border-b border-card-border overflow-x-auto">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                mode === m.key
                  ? "text-accent bg-accent/5 border-b-2 border-accent"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              <span className="ml-1" dangerouslySetInnerHTML={{ __html: m.icon }}></span>
              {m.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {mode === "pension" && <PensionCalc />}
          {mode === "life" && <LifeInsuranceCalc />}
          {mode === "savings" && <SavingsCalc />}
          {mode === "compare" && <CompareCalc />}
        </div>
      </div>
    </section>
  );
}
