function splitPipeline(code) {
	const parts = [];
	let current = "";
	let inQuote = null;
	for (let i = 0; i < code.length; i++) {
		const c = code[i];
		if (inQuote) {
			current += c;
			if (c === inQuote && code[i - 1] !== "\\") inQuote = null;
		} else {
			if (c === '"' || c === "'" || c === "`") {
				inQuote = c;
				current += c;
			} else if (c === "|" && code[i + 1] !== "|" && code[i - 1] !== "|") {
				// Ensure it's a single pipeline and not a logical OR
				parts.push(current.trim());
				current = "";
			} else {
				current += c;
			}
		}
	}
	parts.push(current.trim());
	return parts;
}

export default function parsePipeline(code, initialValue = null) {
	const parts = splitPipeline(code);

	let result;
	let startIndex;

	if (initialValue !== null) {
		result = initialValue;
		startIndex = 0;
	} else {
		if (parts.length <= 1) return code;
		result = parts[0];
		startIndex = 1;
	}

	for (let i = startIndex; i < parts.length; i++) {
		let filter = parts[i];
		if (!filter) continue;

		let funcName, args;
		// Match function call like `filterName(arg1, arg2)`
		const parenMatch = filter.match(
			/^([a-zA-Z_$][a-zA-Z0-9_$$.]*)\s*\((.*)\)$/,
		);
		if (parenMatch) {
			funcName = parenMatch[1];
			args = parenMatch[2];
		} else {
			// Match space-separated arguments (slim style) e.g. `mySection "About", "primary"`
			const spaceMatch = filter.match(/^([a-zA-Z_$][a-zA-Z0-9_$$.]*)\s+(.+)$/);
			if (spaceMatch) {
				funcName = spaceMatch[1];
				args = spaceMatch[2];
			} else {
				funcName = filter.trim();
				args = "";
			}
		}

		if (args.trim().length > 0) {
			result = `${funcName}(${result}, ${args})`;
		} else {
			result = `${funcName}(${result})`;
		}
	}
	return result;
}
