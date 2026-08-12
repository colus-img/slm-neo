const reservedWords = new Set([
	"break",
	"case",
	"catch",
	"class",
	"const",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"else",
	"export",
	"extends",
	"false",
	"finally",
	"for",
	"function",
	"if",
	"import",
	"in",
	"instanceof",
	"new",
	"null",
	"return",
	"super",
	"switch",
	"this",
	"throw",
	"true",
	"try",
	"typeof",
	"var",
	"void",
	"while",
	"with",
	"yield",
	"let",
	"await",
	"arguments",
]);

const globals = new Set([
	"Math",
	"JSON",
	"Date",
	"console",
	"Array",
	"Object",
	"Intl",
	"String",
	"Number",
	"Boolean",
	"RegExp",
	"Error",
	"Promise",
	"window",
	"global",
	"globalThis",
	"process",
	"require",
	"undefined",
	"NaN",
	"ArrayBuffer",
	"DataView",
	"Float32Array",
	"Float64Array",
	"Int8Array",
	"Int16Array",
	"Int32Array",
	"Map",
	"Set",
	"WeakMap",
	"WeakSet",
	"Symbol",
	"Reflect",
	"Proxy",
	"decodeURI",
	"decodeURIComponent",
	"encodeURI",
	"encodeURIComponent",
	"escape",
	"unescape",
	"eval",
	"isFinite",
	"isNaN",
	"parseFloat",
	"parseInt",
	"Infinity",
]);

const slmInternals = new Set([
	"vm",
	"sp",
	"content",
	"extend",
	"partial",
	"mixin",
	"yieldBlock",
	"j",
	"_b",
	"require",
]);

export default function extractIdentifiers(code, excludeList = []) {
	if (typeof code !== "string") return [];

	const excludeSet =
		excludeList instanceof Set ? excludeList : new Set(excludeList);

	// Strip single/double-quoted strings to avoid matching inner words
	let cleanCode = code.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, "");

	// Strip template literals but preserve ${...} expression contents
	// Correctly matches template literals including escaped backticks
	cleanCode = cleanCode.replace(/`((?:\\.|[^`])*)`/g, (_, inner) => {
		const parts = [];
		let pos = 0;
		while ((pos = inner.indexOf("${", pos)) !== -1) {
			let end = pos + 2;
			let depth = 1;
			while (end < inner.length && depth > 0) {
				const char = inner[end++];
				if (char === "{") depth++;
				else if (char === "}") depth--;
				else if (char === "\\") end++; // skip escaped char
			}
			if (depth === 0) {
				parts.push(inner.substring(pos + 2, end - 1));
			}
			pos = end;
		}
		return parts.join(" ");
	});

	// Strip JS comments (line and block) to avoid matching inner words
	cleanCode = cleanCode.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");

	// Remove variable declarations to avoid extracting local variables.
	// This helps with "const a = b" -> only "b" is left as a candidate.
	// It handles "const a, b = c" by stripping everything after the keyword until a semicolon or major boundary.
	cleanCode = cleanCode.replace(
		/\b(?:var|let|const|catch|function)\s+([^;=]*)/g,
		"",
	);

	// Extract words that are not immediately preceded by a dot (e.g. object properties)
	const re = /(?:^|[^a-zA-Z0-9_$.])([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
	const identifiers = new Set();

	let m;
	while ((m = re.exec(cleanCode)) !== null) {
		const id = m[1];
		if (reservedWords.has(id)) continue;
		if (globals.has(id)) continue;
		if (slmInternals.has(id)) continue;
		if (excludeSet.has(id)) continue;
		identifiers.add(id);
	}

	return Array.from(identifiers);
}

export function extractLocalDeclarations(code) {
	if (typeof code !== "string") return [];
	const locals = new Set();

	// Strip strings to avoid false matches during declaration extraction
	const cleanCode = code.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, "");

	// Basic declarations: var/let/const x, y = ...
	const declRe = /\b(?:var|let|const|catch|function)\s+([^;]*)?/g;
	let m;
	while ((m = declRe.exec(cleanCode)) !== null) {
		const part = m[1];
		if (!part) continue;

		// Strip assignment values to isolate variable names: "a = 1, b = 2" -> "a , b "
		// This is a rough approximation but works for most slm cases.
		const idOnlyPart = part.replace(/=[^,;]*/g, "");
		const ids = idOnlyPart.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
		ids.forEach((id) => locals.add(id));
	}

	// Detect destructured declarations: const { a, b: { c } } = ...
	const destructureRe = /\b(?:var|let|const)\s*[\[{]([^;=]*)[\]}]/g;
	let dm;
	while ((dm = destructureRe.exec(cleanCode)) !== null) {
		const inner = dm[1];
		// In destructuring, we want only the target variables.
		// "a, b: { c }" -> we catch a, b, c. (b is a property but excluding it is safe)
		const idOnlyPart = inner.replace(/:[^,}\]]*/g, "");
		const ids = idOnlyPart.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
		ids.forEach((id) => locals.add(id));
	}

	return Array.from(locals);
}
