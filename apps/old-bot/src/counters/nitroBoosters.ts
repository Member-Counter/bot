import Counter from "../typings/Counter";
const NitroBoostersCounter: Counter<"nitro-boosters" | "nitroBoosters"> = {
	aliases: ["nitro-boosters", "nitroBoosters"],
	isPremium: false,
	isEnabled: true,
	lifetime: 0,
	execute: async ({ guild }) => guild.premiumSubscriptionCount
} as const;

export default NitroBoostersCounter;
