import { customRequire } from "./custom_require.js";
import AttrMerge from "./filters/attr_merge.js";
import AttrRemove from "./filters/attr_remove.js";
import Brackets from "./filters/brackets.js";
import CodeAttributes from "./filters/code_attributes.js";
import ControlFlow from "./filters/control_flow.js";
import Controls from "./filters/controls.js";
import Embeddeds from "./filters/embedded.js";
import Engine from "./engine.js";
import Escape from "./filters/escape.js";
import FastHtml from "./html/fast.js";
import Interpolate from "./filters/interpolate.js";
import MultiFlattener from "./filters/multi_flattener.js";
import Parser from "./parser.js";
import StaticMerger from "./filters/static_merger.js";
import StringGenerator from "./generators/string.js";

function Template(VM, options = {}) {
	options.mergeAttrs = options.mergeAttrs || { class: " " };
	options.attrDelims = options.attrDelims || { "(": ")", "[": "]" };

	this.VM = VM;
	this._engine = new Engine();
	this.Embeddeds = Embeddeds;

	this._embedded = new Embeddeds.Embedded();

	this.registerEmbedded("script", new Embeddeds.Javascript());
	this.registerEmbedded(
		"javascript",
		new Embeddeds.Javascript({ typeAttribute: true }),
	);
	this.registerEmbedded("css", new Embeddeds.CSS());

	const filters = this._defaultFilters(options);
	for (let i = 0, il = filters.length; i < il; i++) {
		this._engine.use(filters[i]);
	}
}

const p = Template.prototype;

p._defaultFilters = function (options) {
	return [
		new Parser(options.attrDelims),
		this._embedded,
		new Interpolate(),
		new Brackets(),
		new Controls(),
		new AttrMerge(options.mergeAttrs),
		new CodeAttributes(options.mergeAttrs),
		new AttrRemove(options.mergeAttrs),
		new FastHtml(options.format),
		new Escape(),
		new ControlFlow(),
		new MultiFlattener(),
		new StaticMerger(),
		new StringGenerator(),
	];
};

p.registerEmbedded = function (name, engine) {
	this._embedded.register(name, engine);
};

p.registerEmbeddedFunction = function (name, renderer) {
	const engine = new this.Embeddeds.InterpolateEngine(renderer);
	this.registerEmbedded(name, engine);
};

p.render = function (src, model, options = {}, vm = new this.VM()) {
	return this.compile(src, options, vm)(model, vm);
};

p.renderAsync = function (src, model, options = {}, vm = new this.VM()) {
	return this.compileAsync(src, options, vm)(model, vm);
};

p.compile = function (src, options = {}, vm = new this.VM()) {
	const syncOptions = Object.assign({}, options, { useAsync: false });
	const fn = this.exec(src, syncOptions, vm);

	const fnWrap = (model) => {
		const res = fn.call(model, vm);
		vm.reset();
		return res;
	};
	return fnWrap;
};

p.compileAsync = function (src, options = {}, vm = new this.VM()) {
	const asyncOptions = Object.assign({}, options, { useAsync: true });
	const fn = this.exec(src, asyncOptions, vm);

	return async (model) => {
		const res = await fn.call(model, vm);
		vm.reset();
		return res;
	};
};

p.exec = function (src, options = {}, vm) {
	if (options.useCache !== undefined && !options.useCache) {
		vm._load = vm._loadWithoutCache;
	}

	vm.template = this;
	vm.basePath = options.basePath;
	vm.filename = options.filename;
	vm.require = options.require || customRequire;
	vm.rebind();

	return vm.runInContext(this.src(src, options), vm.filename)[0];
};

p.src = function (src, options = {}) {
	if (options.useAsync) {
		return [
			"[async function(vm) {",
			"vm.m = this;",
			"var sp = vm.stack.length, require = vm.require, content = vm._content, extend = vm._extend, partial = vm._partial, mixin = vm._mixin, j = vm.j;",
			this._engine.exec(src, options),
			"vm.res=_b;return await vm.pop(sp);}]",
		].join("");
	}
	return [
		"[function(vm) {",
		"vm.m = this;",
		"var sp = vm.stack.length, require = vm.require, content = vm._content, extend = vm._extend, partial = vm._partial, mixin = vm._mixin, j = vm.j;",
		this._engine.exec(src, options),
		"vm.res=_b;return vm.pop(sp);}]",
	].join("");
};

p.exports = function () {
	return {
		Template,
		template: this,
		compile: this.compile.bind(this),
		compileAsync: this.compileAsync.bind(this),
		render: this.render.bind(this),
		renderAsync: this.renderAsync.bind(this),
	};
};

export default Template;
