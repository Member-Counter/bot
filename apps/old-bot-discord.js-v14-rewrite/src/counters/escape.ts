import Counter from "../typings/Counter";
const EscapeCounter: Counter<"escape"> = {
	aliases: ["escape"],
	isPremium: false,
	isEnabled: true,
	lifetime: 0,
	execute: async ({ unparsedArgs }) => {
		const delimiters = [",", ":", ";"];

		let escapedString = unparsedArgs;

		delimiters.forEach((delimiter) => {
			escapedString = escapedString.replaceAll(delimiter, `\\${delimiter}`);
		});

		return escapedString;
	}
} as const;

export default EscapeCounter;
