import { VIBE_BADGE_ABI, CUSTOM_VIBE_ABI, PAY_LINKS_ABI } from "./abi";

export const CONTRACT_ADDRESS = "0xEE23d56C3280C14aA9A791E67a89FC7D623EB79A" as `0x${string}`;
export const V1_ADDRESS = CONTRACT_ADDRESS;
export const vibeBadgeContract = { address: CONTRACT_ADDRESS, abi: VIBE_BADGE_ABI } as const;

export const V2_ADDRESS = "0xA4AaCb4F47E700Df36F73fd4288f7276cfF6f5aB" as `0x${string}`;
export const customVibeContract = { address: V2_ADDRESS, abi: CUSTOM_VIBE_ABI } as const;

// PASTE YOUR DEPLOYED VibePayLinks ADDRESS HERE AFTER REMIX DEPLOY
export const PAY_LINKS_ADDRESS = "0x0C38827495bfbA22F6CCF855d79c27f2bC6EDA3F" as `0x${string}`;
export const payLinksContract = { address: PAY_LINKS_ADDRESS, abi: PAY_LINKS_ABI } as const;

export const BADGE_THEMES = [
  { id: 1, label: "GENESIS", accent: "#00f5ff", seed: 10 },
  { id: 2, label: "PHANTOM", accent: "#ff00a8", seed: 20 },
  { id: 3, label: "AURORA",  accent: "#00ff88", seed: 30 },
  { id: 4, label: "VOLTAGE", accent: "#ffee00", seed: 40 },
  { id: 5, label: "VOID",    accent: "#7000ff", seed: 50 },
  { id: 6, label: "REACTOR", accent: "#ff6600", seed: 60 },
] as const;
