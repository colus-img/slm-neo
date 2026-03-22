import VMNode from "../../lib/vm_node.js";
import Template from "../../lib/template.js";
import { assertHtml } from "../helper.js";

describe("Html attribtues", () => {
	let template;
	let htmlTemplate;

	beforeEach(() => {
		template = new Template(VMNode);
		htmlTemplate = new Template(VMNode, {
			mergeAttrs: { class: " " },
			attrDelims: { "(": ")" },
			format: "html",
		});
	});

	test("vue syntax 1", () => {
		assertHtml(
			template,
			['form @submit.prevent="createdProject"'],
			'<form @submit.prevent="createdProject"></form>',
			{},
		);
	});

	test("vue syntax 2", () => {
		assertHtml(
			template,
			['form(@submit.prevent="createdProject")'],
			'<form @submit.prevent="createdProject"></form>',
			{},
		);
	});

	test("vue syntax 3", () => {
		assertHtml(
			template,
			['form v-on:submit="something"'],
			'<form v-on:submit="something"></form>',
			{},
		);
	});

	test("vue syntax 4", () => {
		assertHtml(template, ["form Hello."], "<form>Hello.</form>", {});
	});

	test("ternary operation in attribute", () => {
		assertHtml(
			template,
			["p id=\"${(false ? 'notshown' : 'shown')}\" = this.outputNumber"],
			'<p id="shown">1337</p>',
			{},
		);
	});

	test("ternary operation in attribute 2", () => {
		assertHtml(
			template,
			["p id=(false ? 'notshown' : 'shown') = this.outputNumber"],
			'<p id="shown">1337</p>',
			{},
		);
	});

	test("class attribute merging", () => {
		assertHtml(
			template,
			['.alpha class="beta" test it'],
			'<div class="alpha beta">test it</div>',
			{},
		);
	});

	test("class attribute merging with null", () => {
		assertHtml(
			template,
			['.alpha class="beta" class=null class="gamma" test it'],
			'<div class="alpha beta gamma">test it</div>',
			{},
		);
	});

	test("class attribute merging with empty static", () => {
		assertHtml(
			template,
			['.alpha class="beta" class="" class="gamma" Test it'],
			'<div class="alpha beta gamma">Test it</div>',
			{},
		);
	});

	test("id attribute merging", () => {
		const tmpl = new Template(VMNode, { mergeAttrs: { id: "-" } });
		assertHtml(
			tmpl,
			['#alpha id="beta" Test it'],
			'<div id="alpha-beta">Test it</div>',
			{},
		);
	});

	test("throws multiple id merge by default", () => {
		expect(() => {
			assertHtml(
				template,
				['#alpha id="beta" Test it'],
				'<div id="alpha-beta">Test it</div>',
				{},
			);
		}).toThrow("Multiple id attributes specified");
	});

	test("id attribute merging with array", () => {
		const tmpl = new Template(VMNode, { mergeAttrs: { id: "_" } });
		assertHtml(
			tmpl,
			['#alpha id=["beta", "gamma"] Test it'],
			'<div id="alpha_beta_gamma">Test it</div>',
			{},
		);
	});

	test("custom attribute delimiters", () => {
		assertHtml(
			htmlTemplate,
			['div([value]="boundValue")'],
			'<div [value]="boundValue"></div>',
			{},
		);
	});

	test("xhtml boolean attribute false", () => {
		assertHtml(
			template,
			[
				"- var cond = false",
				"option selected=false Text",
				"option selected=undefined Text2",
				"option selected=cond Text3",
			],
			"<option>Text</option><option>Text2</option><option>Text3</option>",
			{},
		);
	});

	test("html boolean attribute false", () => {
		assertHtml(
			htmlTemplate,
			[
				"- var cond = false",
				"option selected=false Text",
				"option selected=undefined Text2",
				"option selected=cond Text3",
			],
			"<option>Text</option><option>Text2</option><option>Text3</option>",
			{},
		);
	});

	test("xhtml boolean attribute true", () => {
		assertHtml(
			template,
			[
				"- var cond = true",
				"option selected=true Text",
				"option selected=1 Text2",
				"option selected=cond Text3",
			],
			'<option selected="">Text</option><option selected="1">Text2</option><option selected="">Text3</option>',
			{},
		);
	});

	test("html boolean attribute true", () => {
		assertHtml(
			htmlTemplate,
			[
				"- var cond = true",
				"option selected=true Text",
				"option selected=1 Text2",
				"option selected=cond Text3",
			],
			'<option selected>Text</option><option selected="1">Text2</option><option selected>Text3</option>',
			{},
		);
	});

	test("xhtml boolean attribute null", () => {
		assertHtml(
			template,
			[
				"- var cond = null",
				"option selected=null Text",
				"option selected=cond Text2",
			],
			"<option>Text</option><option>Text2</option>",
			{},
		);
	});

	test("html boolean attribute null", () => {
		assertHtml(
			htmlTemplate,
			[
				"- var cond = null",
				"option selected=null Text",
				"option selected=cond Text2",
			],
			"<option>Text</option><option>Text2</option>",
			{},
		);
	});

	test("boolean attribute string2", () => {
		assertHtml(
			template,
			['option selected="selected" Text'],
			'<option selected="selected">Text</option>',
			{},
		);
	});

	test("xhtml boolean attribute shortcut", () => {
		assertHtml(
			template,
			[
				'option(class="clazz" selected) Text',
				'option(selected class="clazz") Text',
			],
			'<option class="clazz" selected="">Text</option><option class="clazz" selected="">Text</option>',
			{},
		);
	});

	test("html boolean attribute shortcut", () => {
		assertHtml(
			htmlTemplate,
			[
				'option(class="clazz" selected) Text',
				'option(selected class="clazz") Text',
			],
			'<option class="clazz" selected>Text</option><option class="clazz" selected>Text</option>',
			{},
		);
	});

	test("array attribute merging", () => {
		assertHtml(
			template,
			[
				'.alpha class="beta" class=[[""], "gamma", null, "delta", [true, false]]',
				'.alpha class=["beta","gamma"]',
			],
			'<div class="alpha beta gamma delta true false"></div><div class="alpha beta gamma"></div>',
			{},
		);
	});

	test("static empty attribute", () => {
		assertHtml(
			template,
			[
				'p(id="marvin" name="" class="" data-info="Illudium Q-36")= this.outputNumber',
			],
			'<p data-info="Illudium Q-36" id="marvin" name="">1337</p>',
			{},
		);
	});

	test("dynamic empty attribute", () => {
		assertHtml(
			template,
			[
				'p(id="marvin" class=null nonempty=("".toString()) data-info="Illudium Q-36")= this.outputNumber',
			],
			'<p data-info="Illudium Q-36" id="marvin" nonempty="">1337</p>',
			{},
		);
	});

	test("weird attribute", () => {
		assertHtml(
			template,
			["p", "  img(src='img.png' whatsthis?!)"],
			'<p><img src="img.png" whatsthis?!="" /></p>',
			{},
		);
	});
});
