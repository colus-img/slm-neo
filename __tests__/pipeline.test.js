import slm from "../lib/slm.js";

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

	it("should support this.filters.filter syntax via pipeline", async () => {
		const src = "p ${this.title | this.filters.upper}";
		const result = await slm.renderAsync(
			src,
			{ title: "hello", filters: { upper: (v) => v.toUpperCase() } },
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
