import slm from "../../lib/slm.js";

describe("Sync Filter Pipeline", () => {
	it("should work in sync mode without await", async () => {
		const src = "p ${val | upper}";
		const result = slm.render(src, {
			val: "hello",
			upper: (v) => v.toUpperCase(),
		});
		expect(result).toBe("<p>HELLO</p>");
	});

	it("should handle chained sync filters", async () => {
		const src = "p ${val | upper | repeat(2)}";
		const result = slm.render(src, {
			val: "hi",
			upper: (v) => v.toUpperCase(),
			repeat: (v, n) => v.repeat(n),
		});
		expect(result).toBe("<p>HIHI</p>");
	});

	it("should handle space-separated arguments in sync mode", async () => {
		const src = 'p ${val | prefix("btn-") | upper}';
		const result = slm.render(src, {
			val: "test",
			prefix: (v, p) => p + v,
			upper: (v) => v.toUpperCase(),
		});
		expect(result).toBe("<p>BTN-TEST</p>");
	});

	it("should still work in async mode correctly", async () => {
		const src = "p ${val | upperAsync}";
		const upperAsync = async (v) =>
			new Promise((resolve) => setTimeout(() => resolve(v.toUpperCase()), 10));
		const result = await slm.renderAsync(src, {
			val: "hello",
			upperAsync,
		});
		expect(result).toBe("<p>HELLO</p>");
	});
});
