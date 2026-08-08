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
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-dark-900/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 sm:h-11 sm:w-11">
            <Image
              src="/vibe-logo.png"
              alt="Vibe"
              fill
              priority
              className="object-contain"
              sizes="44px"
            />
          </div>
          <div className="hidden sm:block">
            <p className="font-mono text-[8px] text-white/30 tracking-[0.25em] leading-none">
              USDC PAYMENTS · ARC
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {wrongChain && (
            <button onClick={() => switchChain({ chainId: arcTestnet.id })}
              className="hidden sm:flex btn-cyber btn-magenta px-3 py-1.5 text-[10px]">
              Switch to Arc
            </button>
          )}
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </div>
    </header>
  );
}
