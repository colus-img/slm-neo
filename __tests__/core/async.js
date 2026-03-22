import VMNode from "../../lib/vm_node.js";
import Template from "../../lib/template.js";

describe("Async/Await Support", () => {
	let template;

	beforeEach(() => {
		template = new Template(VMNode);
	});

	test("render asynchronously with useAsync flag and await interpolation", async () => {
		const src = ["p", "  = await this.fetchData()"].join("\n");

		const model = {
			fetchData: async () => {
				return new Promise((resolve) =>
					setTimeout(() => resolve("Async Content"), 10),
				);
			},
		};

		const fn = template.compile(src, { useAsync: true });

		// fn is now an async function
		const result = await fn(model);

		expect(result).toBe("<p>Async Content</p>");
	});

	test("render asynchronously with `- await` control flow", async () => {
		const src = ["- const msg = await this.getMessage();", "div = msg"].join(
			"\n",
		);

		const model = {
			getMessage: async () => "Hello from Deno!",
		};

		const fn = template.compile(src, { useAsync: true });
		const result = await fn(model);

		expect(result).toBe("<div>Hello from Deno!</div>");
	});

	test("render synchronously when useAsync is false", () => {
		const src = ["p = this.getSyncMessage()"].join("\n");

		const model = {
			getSyncMessage: () => "Sync Content",
		};

		const fn = template.compile(src, { useAsync: false });
		const result = fn(model);

		expect(result).toBe("<p>Sync Content</p>");
	});
});
