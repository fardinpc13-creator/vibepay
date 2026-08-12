"use client";
import { useState, useEffect } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useBalance, useChainId, useSwitchChain } from "wagmi";
import { parseEther, isAddress } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { arcTestnet } from "@/lib/chain";

type Step = "idle" | "signing" | "pending" | "success" | "error";

export function SendTab() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const wrongChain = chainId !== arcTestnet.id;
  const { data: balance, refetch } = useBalance({ address });

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("idle");

  const { sendTransaction, data: txHash, isPending, error, reset } = useSendTransaction();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => { if (isPending) setStep("signing"); }, [isPending]);
  useEffect(() => { if (txHash && !isSuccess) setStep("pending"); }, [txHash, isSuccess]);
  useEffect(() => { if (isSuccess) { setStep("success"); refetch(); } }, [isSuccess]);
  useEffect(() => { if (error) setStep("error"); }, [error]);

  const addressOk = isAddress(to);
  const amountOk = parseFloat(amount) > 0;
  const enough = balance ? parseFloat(amount || "0") <= parseFloat(balance.formatted) : true;
  const canSend = addressOk && amountOk && enough;
  const busy = step === "signing" || step === "pending";

  function send() {
    if (!canSend) return;
    reset(); setStep("idle");
    sendTransaction({ to: to as `0x${string}`, value: parseEther(amount) });
  }

  function startOver() {
    setStep("idle"); setTo(""); setAmount(""); reset();
  }

  if (!isConnected) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="mb-4" style={{ color: "var(--text-dim)" }}>Connect your wallet to send USDC</p>
        <div className="flex justify-center"><ConnectButton /></div>
      </div>
    );
  }

  if (wrongChain) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="mb-4" style={{ color: "var(--text-dim)" }}>Switch to Arc to continue</p>
        <button onClick={() => switchChain({ chainId: arcTestnet.id })} className="btn btn-primary">
          Switch to Arc
        </button>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="px-4 py-12 text-center">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ background: "rgba(0,217,192,0.12)", color: "var(--accent)" }}
        >
          ✓
        </div>
        <h2 className="text-2xl font-bold mb-1">Sent {amount} USDC</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
          To {to.slice(0, 6)}…{to.slice(-4)}
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button onClick={startOver} className="btn btn-primary">Send again</button>
          <a
            href={`${arcTestnet.blockExplorers.default.url}/tx/${txHash}`}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            View receipt
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="card p-5">
        <label className="label">Amount</label>
        <div className="relative mb-1">
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            inputMode="decimal"
            type="number"
            className="field field-amount"
          />
        </div>
        <div className="mb-6 flex items-center justify-between text-sm">
          <span style={{ color: "var(--text-mute)" }}>USDC</span>
          {balance && (
            <button
              onClick={() => setAmount(parseFloat(balance.formatted).toFixed(2))}
              style={{ color: "var(--accent)" }}
              className="font-medium"
            >
              Use max ({parseFloat(balance.formatted).toFixed(2)})
            </button>
          )}
        </div>

        <label className="label">Send to</label>
        <input
          value={to}
          onChange={e => setTo(e.target.value)}
          placeholder="Wallet address (0x…)"
          className={`field mb-2 ${to && !addressOk ? "field-error" : ""}`}
          style={{ fontFamily: "ui-monospace, monospace", fontSize: 14 }}
        />
        {to && !addressOk && (
          <p className="text-sm mb-2" style={{ color: "var(--danger)" }}>
            That doesn&apos;t look like a wallet address
          </p>
        )}
        {!enough && amountOk && (
          <p className="text-sm mb-2" style={{ color: "var(--danger)" }}>
            Not enough USDC in your wallet
          </p>
        )}

        <button onClick={send} disabled={busy || !canSend} className="btn btn-primary mt-4">
          {busy && <span className="spinner" />}
          {step === "signing" ? "Check your wallet" : step === "pending" ? "Sending…" : step === "error" ? "Try again" : "Send"}
        </button>

        {step === "error" && (
          <p className="mt-3 text-sm text-center" style={{ color: "var(--danger)" }}>
            {error?.message?.includes("rejected") ? "You cancelled it in your wallet." : "Something went wrong. Try again."}
          </p>
        )}

        <p className="mt-4 text-center text-sm" style={{ color: "var(--text-mute)" }}>
          Network fee is paid in USDC
        </p>
      </div>
    </div>
  );
}
