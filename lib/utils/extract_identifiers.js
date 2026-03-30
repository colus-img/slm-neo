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
]);

const slmInternals = new Set([
	"vm",
	"sp",
	"content",
	"extend",
	"partial",
	"mixin",
	"j",
	"_b",
	"require",
]);

export default function extractIdentifiers(code, excludeList = []) {
	if (typeof code !== "string") return [];

	// Strip string and template literals to avoid matching inner words
	let cleanCode = code.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "");

	// Remove variable declarations to avoid extracting local variables
	cleanCode = cleanCode.replace(
		/\b(?:var|let|const|catch|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
		"",
	);

	// Extract words that are not immediately preceeded by a dot (e.g. object properties)
	const re = /(?:^|[^a-zA-Z0-9_$.])([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
	const identifiers = new Set();

	let m;
	while ((m = re.exec(cleanCode)) !== null) {
		const id = m[1];
		if (reservedWords.has(id)) continue;
		if (globals.has(id)) continue;
		if (slmInternals.has(id)) continue;
		if (excludeList && excludeList.includes(id)) continue;
		identifiers.add(id);
	}

	return Array.from(identifiers);
}

export function extractLocalDeclarations(code) {
	if (typeof code !== "string") return [];
	const re = /\b(?:var|let|const|catch|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
	const locals = new Set();
	let m;
	while ((m = re.exec(code)) !== null) {
		locals.add(m[1]);
	}
	// also catch simple loop variables where people might write `for (i = 0; ...)`
	// though it's less common without var/let.
	return Array.from(locals);
}
