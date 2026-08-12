import extractIdentifiers, {
	extractLocalDeclarations,
} from "../../lib/utils/extract_identifiers.js";

describe("extractIdentifiers", () => {
	it("should extract simple identifiers", async () => {
		const result = extractIdentifiers("title + price");
		expect(result).toContain("title");
		expect(result).toContain("price");
	});

	it("should not extract reserved words", async () => {
		const result = extractIdentifiers("if (true) return x");
		expect(result).not.toContain("if");
		expect(result).not.toContain("true");
		expect(result).not.toContain("return");
		expect(result).toContain("x");
	});

	it("should not extract globals", async () => {
		const result = extractIdentifiers(
			"Math.round(price) + JSON.stringify(data)",
		);
		expect(result).not.toContain("Math");
		expect(result).not.toContain("JSON");
		expect(result).toContain("price");
		expect(result).toContain("data");
	});

	it("should not extract Infinity", async () => {
		const result = extractIdentifiers("x < Infinity");
		expect(result).not.toContain("Infinity");
		expect(result).toContain("x");
	});

	it("should not extract words inside single/double-quoted strings", async () => {
		const result = extractIdentifiers("title + \"hello\" + 'world'");
		expect(result).toContain("title");
		expect(result).not.toContain("hello");
		expect(result).not.toContain("world");
	});

	it("should not extract words inside JS line comments", async () => {
		const result = extractIdentifiers("title // TODO: fix myVar");
		expect(result).toContain("title");
		expect(result).not.toContain("TODO");
		expect(result).not.toContain("fix");
		expect(result).not.toContain("myVar");
	});

	it("should not extract words inside JS block comments", async () => {
		const result = extractIdentifiers(
			"title /* some comment with foo */ + price",
		);
		expect(result).toContain("title");
		expect(result).toContain("price");
		expect(result).not.toContain("some");
		expect(result).not.toContain("comment");
		expect(result).not.toContain("foo");
	});

	it("should preserve identifiers inside template literal ${} expressions", async () => {
		const result = extractIdentifiers("`Hello ${name}`");
		expect(result).toContain("name");
	});

	it("should not extract static text from template literals", async () => {
		const result = extractIdentifiers("`Hello world ${name}`");
		expect(result).not.toContain("Hello");
		expect(result).not.toContain("world");
		expect(result).toContain("name");
	});

	it("should not extract local variable declarations", async () => {
		const result = extractIdentifiers("const x = title + price");
		expect(result).not.toContain("x");
		expect(result).toContain("title");
		expect(result).toContain("price");
	});

	it("should respect excludeList", async () => {
		const result = extractIdentifiers("title + price", ["title"]);
		expect(result).not.toContain("title");
		expect(result).toContain("price");
	});

	it("should not extract object properties after a dot", async () => {
		const result = extractIdentifiers("user.name");
		expect(result).toContain("user");
		expect(result).not.toContain("name");
	});

	it("should not extract slm internals", async () => {
		const result = extractIdentifiers("vm.reset() + sp + content");
		expect(result).not.toContain("vm");
		expect(result).not.toContain("sp");
		expect(result).not.toContain("content");
	});

	it("should handle non-string input", () => {
		expect(extractIdentifiers(null)).toEqual([]);
	});

	it("should handle excludeList as a Set", () => {
		const excludeSet = new Set(["title"]);
		const result = extractIdentifiers("title + price", excludeSet);
		expect(result).not.toContain("title");
		expect(result).toContain("price");
	});

	it("should handle nested braces in template literal interpolations", () => {
		// Covers depth++ and depth--
		const result = extractIdentifiers("`Hello ${{name: true}}`");
		expect(result).not.toContain("Hello");
		expect(result).toContain("name");
	});

	it("should handle escaped chars in template literal interpolations", () => {
		// Covers char === "\\" (skip escaped char)
		// Using regex because strings are stripped earlier
		const result = extractIdentifiers("`Hello ${/str\\}/ + name}`");
		expect(result).toContain("name");
	});

	it("should handle unclosed template literal expressions", () => {
		// Covers depth !== 0 at the end
		const result = extractIdentifiers("`Hello ${name`");
		expect(result).toEqual([]);
	});
});

describe("extractLocalDeclarations", () => {
	it("should detect var declarations", async () => {
		const result = extractLocalDeclarations("var x = 1");
		expect(result).toContain("x");
	});

	it("should detect let declarations", async () => {
		const result = extractLocalDeclarations("let y = 2");
		expect(result).toContain("y");
	});

	it("should detect const declarations", async () => {
		const result = extractLocalDeclarations("const z = 3");
		expect(result).toContain("z");
	});

	it("should detect function declarations", async () => {
		const result = extractLocalDeclarations("function myFunc() {}");
		expect(result).toContain("myFunc");
	});

	it("should detect destructured object declarations", async () => {
		const result = extractLocalDeclarations("const { a, b } = obj");
		expect(result).toContain("a");
		expect(result).toContain("b");
	});

	it("should detect destructured array declarations", async () => {
		const result = extractLocalDeclarations("const [x, y] = arr");
		expect(result).toContain("x");
		expect(result).toContain("y");
	});

	it("should handle non-string input", async () => {
		expect(extractLocalDeclarations(null)).toEqual([]);
		expect(extractLocalDeclarations(undefined)).toEqual([]);
		expect(extractLocalDeclarations(42)).toEqual([]);
	});

	it("should handle declarations without identifiers", () => {
		// Covers if (!part) continue, and ids = ... || []
		const result = extractLocalDeclarations(
			"var ; const 123 = 1; let { } = obj;",
		);
		expect(result).toEqual([]);
	});
});
