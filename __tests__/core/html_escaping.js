import VMNode from "../../lib/vm_node.js";
import Template from "../../lib/template.js";
import { assertHtml } from "../helper.js";

describe("Html escaping", () => {
	let template;
	beforeEach(() => {
		template = new Template(VMNode);
	});

	test("html will not be escaped", () => {
		assertHtml(
			template,
			['p <Hello> World, meet "Slm".'],
			'<p><Hello> World, meet "Slm".</p>',
			{},
		);
	});

	test("html with newline will not be escaped", () => {
		assertHtml(
			template,
			["p", "  |", "    <Hello> World,", '     meet "Slim".'],
			'<p><Hello> World,\n meet "Slim".</p>',
			{},
		);
	});

	test("html with escaped interpolation", () => {
		assertHtml(
			template,
			[
				"- var x = '\"'",
				"- var content = '<x>'",
				'p class="${x}" test ${content}',
			],
			'<p class="&quot;">test &lt;x&gt;</p>',
			{},
		);
	});

	test("html with raw interpolation", () => {
		assertHtml(
			template,
			['- var x = "text<br/>"', "p ${=x}", "p $y=1", "p y$=x", "p y$y=x"],
			'<p>text<br/></p><p $y="1"></p><p y$="text&lt;br/&gt;"></p><p y$y="text&lt;br/&gt;"></p>',
			{},
		);
	});

	test("html nested escaping", () => {
		assertHtml(
			template,
			["= this.helloBlock(function())", "  | escaped &"],
			"Hello World from @env escaped &amp; Hello World from @env",
			{},
		);
	});

	test("html quoted attr escape", () => {
		assertHtml(
			template,
			['p id="&" class=="&amp;"'],
			'<p class="&amp;" id="&amp;"></p>',
			{},
		);
	});

	test("html quoted attr escape with interpolation", () => {
		assertHtml(
			template,
			[
				'p id="&${\'"\'}" class=="&amp;${\'"\'}"',
				'p id="&${=\'"\'}" class=="&amp;${=\'"\'}"',
			],
			'<p class="&amp;&quot;" id="&amp;&quot;"></p><p class="&amp;"" id="&amp;""></p>',
			{},
		);
	});

	test("html js attr escape", () => {
		assertHtml(
			template,
			["p id=('&'.toString()) class==('&amp;'.toString())"],
			'<p class="&amp;" id="&amp;"></p>',
			{},
		);
	});

	test("html json xss", () => {
		assertHtml(
			template,
			["script:", "  var x = ${= j()};"],
			"<script>var x = undefined;</script>",
			{},
		);

		assertHtml(
			template,
			["script:", "  var x = ${= j(this.address)};"],
			"<script>var x = undefined;</script>",
			{ address: '<script>alert("xss")</script>' },
		);
	});
});
