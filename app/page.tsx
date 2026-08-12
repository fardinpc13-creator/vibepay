"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { BalanceHeader } from "@/components/BalanceHeader";
import { TabNav } from "@/components/TabNav";
import { Footer } from "@/components/Footer";
import { PaymentClaimModal } from "@/components/PaymentClaimModal";

export default function Home() {
  const [claimId, setClaimId] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("claim");
    if (id) setClaimId(id);
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-lg">
        <BalanceHeader />
      </div>
      <TabNav />
      <Footer />

      {claimId && (
        <PaymentClaimModal
          linkId={claimId}
          onClose={() => { setClaimId(null); window.history.replaceState({}, "", "/"); }}
        />
      )}
    </main>
  );
}
