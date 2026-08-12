"use client";
import Image from "next/image";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { vibeBadgeContract, CONTRACT_ADDRESS } from "@/lib/contract";
import { VIBE_BADGE_ABI } from "@/lib/abi";

export function BadgesTab() {
  const { address, isConnected } = useAccount();

  const { data: total } = useReadContract({ ...vibeBadgeContract, functionName: "totalMinted" });
  const { data: max } = useReadContract({ ...vibeBadgeContract, functionName: "MAX_SUPPLY" });
  const { data: mine } = useReadContract({
    ...vibeBadgeContract, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const minted = total ? Number(total) : 0;
  const supply = max ? Number(max) : 1000;
  const owned = mine ? Number(mine) : 0;

  const ids = Array.from({ length: minted }, (_, i) => i + 1);
  const calls = ids.map(id => ({
    address: CONTRACT_ADDRESS,
    abi: VIBE_BADGE_ABI,
    functionName: "ownerOf" as const,
    args: [BigInt(id)] as [bigint],
  }));
  const { data: owners } = useReadContracts({
    contracts: calls,
    query: { enabled: isConnected && !!address && minted > 0 },
  });

  const myIds = owners
    ?.map((r, i) => ({ owner: r.result as string | undefined, id: ids[i] }))
    .filter(({ owner }) => owner?.toLowerCase() === address?.toLowerCase())
    .map(({ id }) => id) ?? [];

  return (
    <div className="px-4 py-6">
      <div className="card p-5 mb-6">
        <h2 className="text-lg font-semibold mb-1">Genesis Badges</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-dim)" }}>
          The original collection. Holding one marks your wallet as verified.
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{minted}</span>
          <span style={{ color: "var(--text-dim)" }}>of {supply} claimed</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.round((minted / supply) * 100)}%`, background: "var(--accent)" }}
          />
        </div>
      </div>

      <h3 className="text-base font-semibold mb-3">Your badges</h3>

      {!isConnected ? (
        <div className="card p-6 text-center">
          <p className="mb-4" style={{ color: "var(--text-dim)" }}>Connect your wallet to see your badges</p>
          <div className="flex justify-center"><ConnectButton /></div>
        </div>
      ) : myIds.length === 0 ? (
        <div className="card p-6 text-center">
          <p style={{ color: "var(--text-dim)" }}>You don&apos;t have any badges yet.</p>
        </div>
      ) : (
        <>
          <p className="text-sm mb-3" style={{ color: "var(--text-dim)" }}>
            You own {owned} {owned === 1 ? "badge" : "badges"}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {myIds.map(id => (
              <div key={id} className="card overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={`https://picsum.photos/seed/${id * 7}/200/200`}
                    alt={`Badge ${id}`}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
                <p className="p-2 text-center text-sm font-medium">#{id}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
