"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useChainId, useSwitchChain } from "wagmi";
import { arcTestnet } from "@/lib/chain";

export function Navbar() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const wrongChain = chainId !== arcTestnet.id;

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ background: "rgba(10,11,15,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="relative h-9 w-9">
          <Image src="/vibe-logo.png" alt="Vibe" fill priority className="object-contain" sizes="36px" />
        </div>

        <div className="flex items-center gap-2">
          {wrongChain && (
            <button onClick={() => switchChain({ chainId: arcTestnet.id })} className="btn btn-ghost btn-sm">
              Switch network
            </button>
          )}
          <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
        </div>
      </div>
    </header>
  );
}
