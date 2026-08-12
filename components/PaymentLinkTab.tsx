"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useChainId, useSwitchChain, useReadContract } from "wagmi";
import { parseEther, toHex } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { payLinksContract, PAY_LINKS_ADDRESS } from "@/lib/contract";
import { arcTestnet } from "@/lib/chain";

type Step = "idle" | "signing" | "pending" | "success" | "error";
const KEY = "vibe_my_links";

interface Saved { id: string; amount: string; note: string; url: string; }

function newId(): `0x${string}` {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return toHex(b) as `0x${string}`;
}

export function PaymentLinkTab() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const wrongChain = chainId !== arcTestnet.id;
  const { data: balance, refetch: refetchBal } = useBalance({ address });

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [id, setId] = useState<`0x${string}` | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<Saved[]>([]);

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const notReady = PAY_LINKS_ADDRESS === "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    try { const r = localStorage.getItem(KEY); if (r) setLinks(JSON.parse(r)); } catch {}
  }, []);

  useEffect(() => { if (isPending) setStep("signing"); }, [isPending]);
  useEffect(() => { if (txHash && !isSuccess) setStep("pending"); }, [txHash, isSuccess]);
  useEffect(() => {
    if (isSuccess && id) {
      setStep("success");
      refetchBal();
      const url = `${window.location.origin}/?claim=${id}`;
      const next = [{ id, amount, note, url }, ...links].slice(0, 20);
      setLinks(next);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    }
  }, [isSuccess]);
  useEffect(() => { if (error) setStep("error"); }, [error]);

  const amountOk = parseFloat(amount) > 0;
  const enough = balance ? parseFloat(amount || "0") <= parseFloat(balance.formatted) : true;
  const busy = step === "signing" || step === "pending";
  const url = id ? `${typeof window !== "undefined" ? window.location.origin : ""}/?claim=${id}` : "";

  function create() {
    if (!amountOk || notReady) return;
    const newLinkId = newId();
    setId(newLinkId);
    reset(); setStep("idle");
    writeContract({ ...payLinksContract, functionName: "createLink", args: [newLinkId, note.trim()], value: parseEther(amount) });
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function startOver() {
    setStep("idle"); setAmount(""); setNote(""); setId(null); setCopied(false); reset();
  }

  if (!isConnected) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="mb-4" style={{ color: "var(--text-dim)" }}>Connect your wallet to create a link</p>
        <div className="flex justify-center"><ConnectButton /></div>
      </div>
    );
  }

  if (wrongChain) {
    return (
      <div className="px-4 py-12 text-center">
        <button onClick={() => switchChain({ chainId: arcTestnet.id })} className="btn btn-primary max-w-xs mx-auto">
          Switch to Arc
        </button>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="px-4 py-8">
        <div className="text-center mb-6">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
            style={{ background: "rgba(124,92,255,0.15)", color: "var(--violet)" }}
          >
            ✓
          </div>
          <h2 className="text-2xl font-bold mb-1">{amount} USDC ready to claim</h2>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Anyone with this link can claim it
          </p>
        </div>

        <div className="card p-4 mb-4">
          <p className="text-sm break-all" style={{ color: "var(--text-dim)", fontFamily: "ui-monospace, monospace" }}>
            {url}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => copy(url)} className="btn btn-violet">
            {copied ? "Copied" : "Copy link"}
          </button>
          <button onClick={startOver} className="btn btn-ghost">Create another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {notReady && (
        <div className="card p-4 mb-4" style={{ borderColor: "var(--danger)" }}>
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            Payment links aren&apos;t set up yet. Deploy the contract first.
          </p>
        </div>
      )}

      <div className="card p-5">
        <p className="text-sm mb-5" style={{ color: "var(--text-dim)" }}>
          Set aside USDC and share a link. Whoever opens it can claim the money — no wallet address needed.
        </p>

        <label className="label">Amount to send</label>
        <input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
          inputMode="decimal"
          type="number"
          className="field field-amount mb-1"
        />
        <div className="mb-6 flex items-center justify-between text-sm">
          <span style={{ color: "var(--text-mute)" }}>USDC</span>
          {balance && (
            <span style={{ color: "var(--text-mute)" }}>
              Balance {parseFloat(balance.formatted).toFixed(2)}
            </span>
          )}
        </div>

        <label className="label">What&apos;s it for? (optional)</label>
        <input
          value={note}
          onChange={e => setNote(e.target.value.slice(0, 60))}
          placeholder="Lunch, rent, thanks…"
          className="field mb-2"
        />

        {!enough && amountOk && (
          <p className="text-sm mb-2" style={{ color: "var(--danger)" }}>
            Not enough USDC in your wallet
          </p>
        )}

        <button onClick={create} disabled={busy || !amountOk || !enough || notReady} className="btn btn-violet mt-4">
          {busy && <span className="spinner" />}
          {step === "signing" ? "Check your wallet" : step === "pending" ? "Creating…" : step === "error" ? "Try again" : "Create link"}
        </button>

        {step === "error" && (
          <p className="mt-3 text-sm text-center" style={{ color: "var(--danger)" }}>
            {error?.message?.includes("rejected") ? "You cancelled it in your wallet." : "Something went wrong. Try again."}
          </p>
        )}

        <p className="mt-4 text-center text-sm" style={{ color: "var(--text-mute)" }}>
          You can cancel and get your USDC back anytime before it&apos;s claimed
        </p>
      </div>

      {links.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold mb-3">Your links</h3>
          <div className="flex flex-col gap-2">
            {links.map(l => <LinkRow key={l.id} link={l} onCopy={() => copy(l.url)} copied={copied} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function LinkRow({ link, onCopy, copied }: { link: Saved; onCopy: () => void; copied: boolean }) {
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const { data: state, refetch } = useReadContract({
    ...payLinksContract,
    functionName: "getLink",
    args: [link.id as `0x${string}`],
  });

  useEffect(() => { if (isSuccess) refetch(); }, [isSuccess]);

  const claimed = state ? (state[3] as boolean) : false;
  const cancelled = state ? (state[4] as boolean) : false;
  const status = claimed ? "Claimed" : cancelled ? "Refunded" : "Waiting";
  const statusColor = claimed ? "var(--accent)" : cancelled ? "var(--text-mute)" : "var(--violet)";

  return (
    <div className="card flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="font-semibold">{link.amount} USDC</p>
        {link.note && (
          <p className="truncate text-sm" style={{ color: "var(--text-dim)" }}>{link.note}</p>
        )}
        <p className="text-sm" style={{ color: statusColor }}>{status}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={onCopy} className="btn btn-ghost btn-sm">Copy</button>
        {!claimed && !cancelled && (
          <button
            onClick={() => writeContract({ ...payLinksContract, functionName: "cancel", args: [link.id as `0x${string}`] })}
            disabled={isPending}
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--danger)" }}
          >
            {isPending ? "…" : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}
