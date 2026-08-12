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

	describe("Regression Tests", () => {
		test("implicit await for direct function call in renderAsync", async () => {
			const src = "p = this.asyncMsg()";
			const model = {
				asyncMsg: async () => "Async Without Await Keyword",
			};
			const result = await template.renderAsync(src, model);
			expect(result).toBe("<p>Async Without Await Keyword</p>");
		});

		test("async block callback should be awaitable in helper", async () => {
			const src = ["== this.wrap()", "  | Inner Content"].join("\n");

			const model = {
				wrap: async function (cb) {
					const content = await cb();
					return `<div class="wrapper">${content.toString().trim()}</div>`;
				},
			};

			const result = await template.renderAsync(src, model);
			expect(result).toBe('<div class="wrapper">Inner Content</div>');
		});

		test("unescaped block output (==) should not be escaped", async () => {
			const src = ["== this.box()", "  | <p>Raw</p>"].join("\n");

			const model = {
				box: async (cb) => {
					const content = typeof cb === "function" ? await cb() : "";
					return `<div class="box">${content}</div>`;
				},
			};

			const result = await template.renderAsync(src, model);
			expect(result).toBe('<div class="box"><p>Raw</p></div>');
		});

		test("escaped block output (=) should be escaped", async () => {
			const src = ["= this.box()", "  | <p>Escape Me</p>"].join("\n");

			const model = {
				box: async (cb) => {
					const content = typeof cb === "function" ? await cb() : "";
					return `<div class="box">${content}</div>`;
				},
			};

			const result = await template.renderAsync(src, model);
			expect(result).toBe(
				"&lt;div class=&quot;box&quot;&gt;&lt;p&gt;Escape Me&lt;/p&gt;&lt;/div&gt;",
			);
		});

		test("implicit await for attribute value in renderAsync", async () => {
			const src = "a href=this.asyncUrl() Link";
			const model = {
				asyncUrl: async () => "https://example.com",
			};
			const result = await template.renderAsync(src, model);
			expect(result).toBe('<a href="https://example.com">Link</a>');
		});

		test("implicit await for array attribute value in renderAsync", async () => {
			const src = 'div class=["btn", this.asyncClass()]';
			const model = {
				asyncClass: async () => "btn-primary",
			};
			const result = await template.renderAsync(src, model);
			expect(result).toBe('<div class="btn btn-primary"></div>');
		});
	});
});
