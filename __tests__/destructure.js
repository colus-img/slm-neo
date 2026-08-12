import slm from "../lib/slm.js";

describe("Destructuring (this omission)", () => {
	it("should automatically extract variables safely", async () => {
		const src = "p = title\np = user.name\np = Math.round(price)";
		const result = slm.render(src, {
			title: "Hello",
			user: { name: "Slm" },
			price: 100.5,
		});
		expect(result).toBe("<p>Hello</p><p>Slm</p><p>101</p>");
	});

	it("should fallback to helpers if missing in data", async () => {
		const src = "p = upper(title)";
		const result = slm.render(src, {
			title: "hello",
			helpers: { upper: (v) => v.toUpperCase() },
		});
		expect(result).toBe("<p>HELLO</p>");
	});

	it("should allow disabling autoDestructuring", async () => {
		const src = "p = this.title";
		// Trying to use title without this. throws ReferenceError when disabled
		expect(() =>
			slm.render("p = title", { title: "hello" }, { autoDestructuring: false }),
		).toThrow();
		const result = slm.render(
			src,
			{ title: "Explicit" },
			{ autoDestructuring: false },
		);
		expect(result).toBe("<p>Explicit</p>");
	});

	it("should respect destructuringExclude option", async () => {
		// If excluded, it won't be inside the generated var { ... } = this
		// Using a non-existent variable directly throws ReferenceError
		expect(() =>
			slm.render(
				"p = myVar",
				{ myVar: 123 },
				{ destructuringExclude: ["myVar"] },
			),
		).toThrow();
	});

	it("should not break with var re-declarations in loops", async () => {
		const src =
			"- for (var i = 1; i <= 3; i++)\n  p = i\n- for (let j = 1; j <= 2; j++)\n  p = j";
		const result = slm.render(src, {});
		expect(result).toBe("<p>1</p><p>2</p><p>3</p><p>1</p><p>2</p>");
	});
});
