"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId, useSwitchChain } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { payLinksContract } from "@/lib/contract";
import { arcTestnet } from "@/lib/chain";

type Step = "idle" | "signing" | "pending" | "success" | "error";

export function PaymentClaimModal({ linkId, onClose }: { linkId: string; onClose: () => void }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const wrongChain = chainId !== arcTestnet.id;
  const [step, setStep] = useState<Step>("idle");

  const { data: link, isLoading, refetch } = useReadContract({
    ...payLinksContract,
    functionName: "getLink",
    args: [linkId as `0x${string}`],
  });

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => { if (isPending) setStep("signing"); }, [isPending]);
  useEffect(() => { if (txHash && !isSuccess) setStep("pending"); }, [txHash, isSuccess]);
  useEffect(() => { if (isSuccess) { setStep("success"); refetch(); } }, [isSuccess]);
  useEffect(() => { if (error) setStep("error"); }, [error]);

  const creator = link ? (link[0] as string) : "";
  const wei = link ? (link[1] as bigint) : BigInt(0);
  const note = link ? (link[2] as string) : "";
  const claimed = link ? (link[3] as boolean) : false;
  const cancelled = link ? (link[4] as boolean) : false;

  const exists = creator && creator !== "0x0000000000000000000000000000000000000000";
  const amount = wei ? parseFloat(formatEther(wei)).toFixed(2) : "0";
  const busy = step === "signing" || step === "pending";

  function claim() {
    reset(); setStep("idle");
    writeContract({ ...payLinksContract, functionName: "claim", args: [linkId as `0x${string}`] });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(10,11,15,0.85)" }}
    >
      <div className="card w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl leading-none"
          style={{ color: "var(--text-mute)" }}
          aria-label="Close"
        >
          ×
        </button>

        {isLoading ? (
          <p className="py-10 text-center" style={{ color: "var(--text-dim)" }}>Loading…</p>
        ) : !exists ? (
          <div className="py-6 text-center">
            <h2 className="text-xl font-bold mb-2">Link not found</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
              This payment link doesn&apos;t exist or was never created.
            </p>
            <button onClick={onClose} className="btn btn-ghost">Close</button>
          </div>
        ) : step === "success" ? (
          <div className="py-4 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
              style={{ background: "rgba(0,217,192,0.12)", color: "var(--accent)" }}
            >
              ✓
            </div>
            <h2 className="text-2xl font-bold mb-1">{amount} USDC received</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>It&apos;s in your wallet now</p>
            <div className="flex flex-col gap-3">
              <button onClick={onClose} className="btn btn-primary">Done</button>
              <a
                href={`${arcTestnet.blockExplorers.default.url}/tx/${txHash}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                View receipt
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm mb-2" style={{ color: "var(--text-dim)" }}>Someone sent you</p>
            <h2 className="text-4xl font-bold tracking-tight mb-2">
              {amount} <span className="text-xl" style={{ color: "var(--text-dim)" }}>USDC</span>
            </h2>
            {note && <p className="mb-4" style={{ color: "var(--text-dim)" }}>&ldquo;{note}&rdquo;</p>}
            <p className="text-sm mb-6" style={{ color: "var(--text-mute)", fontFamily: "ui-monospace, monospace" }}>
              From {creator.slice(0, 6)}…{creator.slice(-4)}
            </p>

            {claimed ? (
              <div className="card p-4" style={{ background: "var(--surface-2)" }}>
                <p className="font-semibold mb-1">Already claimed</p>
                <p className="text-sm" style={{ color: "var(--text-dim)" }}>Someone got here first.</p>
              </div>
            ) : cancelled ? (
              <div className="card p-4" style={{ background: "var(--surface-2)" }}>
                <p className="font-semibold mb-1">Link cancelled</p>
                <p className="text-sm" style={{ color: "var(--text-dim)" }}>The sender took the money back.</p>
              </div>
            ) : !isConnected ? (
              <div>
                <p className="text-sm mb-4" style={{ color: "var(--text-dim)" }}>
                  Connect a wallet to claim it
                </p>
                <div className="flex justify-center"><ConnectButton /></div>
              </div>
            ) : wrongChain ? (
              <button onClick={() => switchChain({ chainId: arcTestnet.id })} className="btn btn-primary">
                Switch to Arc
              </button>
            ) : (
              <>
                <button onClick={claim} disabled={busy} className="btn btn-primary">
                  {busy && <span className="spinner" />}
                  {step === "signing" ? "Check your wallet" : step === "pending" ? "Claiming…" : step === "error" ? "Try again" : `Claim ${amount} USDC`}
                </button>
                {step === "error" && (
                  <p className="mt-3 text-sm" style={{ color: "var(--danger)" }}>
                    {error?.message?.includes("rejected")
                      ? "You cancelled it in your wallet."
                      : error?.message?.includes("Already claimed")
                      ? "Someone just claimed this."
                      : "Couldn't claim. Try again."}
                  </p>
                )}
                <p className="mt-4 text-sm" style={{ color: "var(--text-mute)" }}>
                  Network fee is paid in USDC
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
