import slm from "../lib/slm.js";

describe("Filter Pipeline Syntax (|)", () => {
	it("should transform single filter", () => {
		const src = "p ${title | upper}";
		const result = slm.render(src, {
			title: "hello",
			filters: { upper: (v) => v.toUpperCase() },
		});
		expect(result).toBe("<p>HELLO</p>");
	});

	it("should transform chained filters", () => {
		const src = "p ${title | upper | repeat(2)}";
		const result = slm.render(src, {
			title: "he",
			filters: {
				upper: (v) => v.toUpperCase(),
				repeat: (v, n) => v.repeat(n),
			},
		});
		expect(result).toBe("<p>HEHE</p>");
	});

	it("should handle arguments in filters", () => {
		const src = 'p ${message | replace("x", "y")}';
		const result = slm.render(src, {
			message: "xox",
			filters: { replace: (v, a, b) => v.replace(new RegExp(a, "g"), b) },
		});
		expect(result).toBe("<p>yoy</p>");
	});

	it("should transform interpolation pipeline", () => {
		const src = "p class=\"${ size | prefix('btn-') }\" ${ label | upper }";
		const result = slm.render(src, {
			size: "large",
			label: "button",
			filters: { prefix: (v, p) => p + v, upper: (v) => v.toUpperCase() },
		});
		expect(result).toBe('<p class="btn-large">BUTTON</p>');
	});

	it("should not break on logical OR ||", () => {
		const src = 'p = title || "default"';
		const result = slm.render(src, { title: "" });
		expect(result).toBe("<p>default</p>");
	});

	it("should ignore pipe inside strings without expanding", () => {
		// String contains |, and should not be parsed as a pipeline
		const src = 'p ${"a | b"}';
		const result = slm.render(src, {});
		expect(result).toBe("<p>a | b</p>");
	});

	it("should support this.filters.filter syntax via pipeline", () => {
		const src = "p ${this.title | this.filters.upper}";
		const result = slm.render(
			src,
			{ title: "hello", filters: { upper: (v) => v.toUpperCase() } },
			{ autoDestructuring: false },
		);
		expect(result).toBe("<p>HELLO</p>");
	});
});
