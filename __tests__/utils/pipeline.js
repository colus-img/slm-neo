import slm from "../../lib/slm.js";

describe("Filter Pipeline Syntax (|)", () => {
	it("should transform single filter", async () => {
		const src = "p ${title | upper}";
		const result = await slm.renderAsync(src, {
			title: "hello",
			upper: (v) => v.toUpperCase(),
		});
		expect(result).toBe("<p>HELLO</p>");
	});

	it("should transform chained filters", async () => {
		const src = "p ${title | upper | repeat(2)}";
		const result = await slm.renderAsync(src, {
			title: "he",
			upper: (v) => v.toUpperCase(),
			repeat: (v, n) => v.repeat(n),
		});
		expect(result).toBe("<p>HEHE</p>");
	});

	it("should handle arguments in filters", async () => {
		const src = 'p ${message | replace("x", "y")}';
		const result = await slm.renderAsync(src, {
			message: "xox",
			replace: (v, a, b) => v.replace(new RegExp(a, "g"), b),
		});
		expect(result).toBe("<p>yoy</p>");
	});

	it("should transform interpolation pipeline", async () => {
		const src = "p class=\"${ size | prefix('btn-') }\" ${ label | upper }";
		const result = await slm.renderAsync(src, {
			size: "large",
			label: "button",
			prefix: (v, p) => p + v,
			upper: (v) => v.toUpperCase(),
		});
		expect(result).toBe('<p class="btn-large">BUTTON</p>');
	});

	it("should not break on logical OR ||", async () => {
		const src = 'p = title || "default"';
		const result = await slm.renderAsync(src, { title: "" });
		expect(result).toBe("<p>default</p>");
	});

	it("should ignore pipe inside strings without expanding", async () => {
		// String contains |, and should not be parsed as a pipeline
		const src = 'p ${"a | b"}';
		const result = await slm.renderAsync(src, {});
		expect(result).toBe("<p>a | b</p>");
	});

	it("should support this.helpers.filter syntax via pipeline", async () => {
		const src = "p ${this.title | this.helpers.upper}";
		const result = await slm.renderAsync(
			src,
			{ title: "hello", helpers: { upper: (v) => v.toUpperCase() } },
			{ autoDestructuring: false },
		);
		expect(result).toBe("<p>HELLO</p>");
	});

	it("should support async filters automatically", async () => {
		const upperAsync = async (v) =>
			new Promise((resolve) => setTimeout(() => resolve(v.toUpperCase()), 10));
		const src = "p ${title | upperAsync}";
		const result = await slm.renderAsync(src, {
			title: "hello",
			upperAsync,
		});
		expect(result).toBe("<p>HELLO</p>");
	});
});

import parsePipeline from "../../lib/utils/pipeline_parser.js";
describe("pipeline_parser direct coverage", () => {
	it("uses initialValue and parses space parameters", () => {
		// initialValue is prepended as the first argument
		const parsed = parsePipeline("helperName arg1, arg2", "myInitialV", {
			useAsync: false,
		});
		expect(parsed).toBe("helperName(myInitialV, arg1, arg2)");

		// Space-separated helper name without extra args
		const parsed2 = parsePipeline("helperName", "myInitialV", {
			useAsync: false,
		});
		expect(parsed2).toBe("helperName(myInitialV)");

		// Empty parens are stripped; initialValue is inserted
		const parsed3 = parsePipeline("helperName()", "myInitialV", {
			useAsync: false,
		});
		expect(parsed3).toBe("helperName(myInitialV)");
		// Empty segments between double pipes are skipped
		expect(
			parsePipeline("helperName | | another", "myInitialV", {
				useAsync: false,
			}),
		).toBe("another(helperName(myInitialV))");
		// When options is omitted, defaults to async mode (await)
		expect(parsePipeline("a | b")).toBe("(await b(a))");
	});
});
