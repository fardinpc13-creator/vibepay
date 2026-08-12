"use client";
import { useState } from "react";
import { SendTab } from "./SendTab";
import { PaymentLinkTab } from "./PaymentLinkTab";
import { BadgesTab } from "./BadgesTab";

const TABS = [
  { id: "send", label: "Send" },
  { id: "link", label: "Payment link" },
  { id: "badges", label: "Badges" },
] as const;

type TabId = typeof TABS[number]["id"];

export function TabNav() {
  const [active, setActive] = useState<TabId>("send");

  return (
    <div>
      <div
        className="sticky top-[61px] z-40"
        style={{ background: "rgba(10,11,15,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="mx-auto flex max-w-lg px-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`tab ${active === t.id ? "tab-active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg">
        {active === "send" && <SendTab />}
        {active === "link" && <PaymentLinkTab />}
        {active === "badges" && <BadgesTab />}
      </div>
    </div>
  );
}
