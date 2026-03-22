import VMNode from "../../lib/vm_node.js";
import Template from "../../lib/template.js";

describe("Async/Await Support", () => {
	let template;

	beforeEach(() => {
		template = new Template(VMNode);
	});

	test("render asynchronously with compileAsync and await interpolation", async () => {
		const src = ["p", "  = await this.fetchData()"].join("\n");

		const model = {
			fetchData: async () => {
				return new Promise((resolve) =>
					setTimeout(() => resolve("Async Content"), 10),
				);
			},
		};

		const fn = template.compileAsync(src);

		// fn is now an async function
		const result = await fn(model);

		expect(result).toBe("<p>Async Content</p>");
	});

	test("render asynchronously with renderAsync and `- await` control flow", async () => {
		const src = ["- const msg = await this.getMessage();", "div = msg"].join(
			"\n",
		);

		const model = {
			getMessage: async () => "Hello from Deno!",
		};

		const result = await template.renderAsync(src, model);

		expect(result).toBe("<div>Hello from Deno!</div>");
	});

	test("render synchronously with compile", () => {
		const src = ["p = this.getSyncMessage()"].join("\n");

		const model = {
			getSyncMessage: () => "Sync Content",
		};

		const fn = template.compile(src);
		const result = fn(model);

		expect(result).toBe("<p>Sync Content</p>");
	});

	test("render asynchronously with `- if await` condition using compileAsync", async () => {
		const src = [
			"- if await this.isActive()",
			"  p Active",
			"- else",
			"  p Inactive",
		].join("\n");

		const model = {
			isActive: async () => true,
		};

		const fn = template.compileAsync(src);
		const result = await fn(model);

		expect(result).toBe("<p>Active</p>");
	});

	test("render asynchronously with `- for await` loop using renderAsync", async () => {
		const src = [
			"- for (const item of await this.getItems())",
			"  li = item",
		].join("\n");

		const model = {
			getItems: async () => ["A", "B"],
		};

		const result = await template.renderAsync(src, model);

		expect(result).toBe("<li>A</li><li>B</li>");
	});
});
