import VMNode from "../../lib/vm_node.js";
import Template from "../../lib/template.js";
import { assertHtml } from "../support/assertions.js";

describe("Code output", () => {
	let template;
	beforeEach(() => {
		template = new Template(VMNode);
	});

	test("render with call", async () => {
		await assertHtml(
			template,
			["p", "  = this.helloWorld"],
			"<p>Hello World from @env</p>",
			{},
		);
	});

	test("render with trailing whitespace", async () => {
		await assertHtml(
			template,
			["p", "  => this.helloWorld"],
			"<p>Hello World from @env </p>",
			{},
		);
	});

	test("render with leading whitespace", async () => {
		await assertHtml(
			template,
			["p", "  =< this.helloWorld"],
			"<p> Hello World from @env</p>",
			{},
		);
	});

	test("render with trailing whitespace after tag", async () => {
		await assertHtml(
			template,
			["p=> this.helloWorld"],
			"<p>Hello World from @env</p> ",
			{},
		);
	});

	test("no escape render with trailing whitespace", async () => {
		await assertHtml(
			template,
			["p", "  ==> this.helloWorld"],
			"<p>Hello World from @env </p>",
			{},
		);
	});

	test("no escape render with trailing whitespace after tag", async () => {
		await assertHtml(
			template,
			["p==> this.helloWorld"],
			"<p>Hello World from @env</p> ",
			{},
		);
	});

	test("no escape render with trailing whitespace after tag", async () => {
		await assertHtml(
			template,
			["p==> this.helloWorld"],
			"<p>Hello World from @env</p> ",
			{},
		);
	});

	test("render with backslash end", async () => {
		await assertHtml(
			template,
			[
				"p = \\",
				'"Hello" + \\',
				'" JS!"',
				"- var variable = 1 + \\",
				"      2 + \\",
				" 3",
				"= variable + \\",
				"  1",
			],
			"<p>Hello JS!</p>7",
			{},
		);
	});

	test("render multi line code", async () => {
		await assertHtml(
			template,
			[
				"-  var niceX = function(x) {",
				"-     return x + 'nice';",
				"-  }",
				'p = niceX("Very ")',
			],
			"<p>Very nice</p>",
			{},
		);
	});

	test("render with comma end", async () => {
		await assertHtml(
			template,
			['p = this.message("Hello",', '                 "JS!")'],
			"<p>Hello JS!</p>",
			{},
		);
	});

	test("render with block and synchronous callback", async () => {
		const src = ["== this.wrap()", "  | Inner Content"].join("\n");
		const model = {
			wrap: function (cb) {
				const content = cb();
				return `<div class="wrapper">${content.toString().trim()}</div>`;
			},
		};
		const result = template.render(src, model);
		expect(result).toBe('<div class="wrapper">Inner Content</div>');
	});

	test("render with block and unescaped output (==)", async () => {
		const src = ["== this.box()", "  | <p>Raw</p>"].join("\n");
		const model = {
			box: (cb) => {
				const content = typeof cb === "function" ? cb() : "";
				return `<div class="box">${content}</div>`;
			},
		};
		const result = template.render(src, model);
		expect(result).toBe('<div class="box"><p>Raw</p></div>');
	});

	test("render with block and escaped output (=)", async () => {
		const src = ["= this.box()", "  | <p>Escape Me</p>"].join("\n");
		const model = {
			box: (cb) => {
				const content = typeof cb === "function" ? cb() : "";
				return `<div class="box">${content}</div>`;
			},
		};
		const result = template.render(src, model);
		expect(result).toBe(
			"&lt;div class=&quot;box&quot;&gt;&lt;p&gt;Escape Me&lt;/p&gt;&lt;/div&gt;",
		);
	});

	test("render with array attribute containing numbers (sync parity)", async () => {
		const src = 'div class=["btn", 123]';
		const result = template.render(src, {});
		expect(result).toBe('<div class="btn 123"></div>');
	});
});
