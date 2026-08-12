"use client";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { vibeBadgeContract } from "@/lib/contract";

export function BalanceHeader() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: badges } = useReadContract({
    ...vibeBadgeContract,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const verified = badges ? Number(badges) > 0 : false;

  if (!isConnected) {
    return (
      <div className="px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-2">Send USDC on Arc</h1>
        <p className="mb-6" style={{ color: "var(--text-dim)" }}>
          Connect your wallet to get started
        </p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 text-center">
      <p className="text-sm mb-1" style={{ color: "var(--text-dim)" }}>Your balance</p>
      <p className="text-4xl font-bold tracking-tight mb-3">
        {balance ? parseFloat(balance.formatted).toFixed(2) : "0.00"}
        <span className="text-xl ml-2" style={{ color: "var(--text-dim)" }}>USDC</span>
      </p>
      {verified && <span className="pill pill-verified">Verified holder</span>}
    </div>
  );
}
