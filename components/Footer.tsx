export function Footer() {
  return (
    <footer className="mx-auto max-w-lg px-4 py-10 text-center">
      <div className="divider mb-6" />
      <p className="text-sm" style={{ color: "var(--text-mute)" }}>
        Running on Arc Testnet. Network fees are paid in USDC.
      </p>
      <div className="mt-3 flex justify-center gap-5 text-sm">
        <a
          href="https://faucet.circle.com"
          target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--accent)" }}
        >
          Get test USDC
        </a>
        <a
          href="https://testnet.arcscan.app"
          target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--text-dim)" }}
        >
          Explorer
        </a>
      </div>
    </footer>
  );
}
