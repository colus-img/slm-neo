import Template from "../lib/template.js";
import VMNode from "../lib/vm_node.js";

describe("Template", () => {
	it("should parse src with default options", () => {
		const tmpl = new Template(VMNode);
		// This covers `options = {}` default parameter
		expect(tmpl.src("p", undefined)).toBeDefined();
	});

	it("should not use cache if explicitly disabled", () => {
		const tmpl = new Template(VMNode);
		const vm = new tmpl.VM();
		// Passing { useCache: false } will make options.useCache === false and !== undefined
		tmpl.exec("p", { useCache: false }, vm);
		expect(vm._load).toBe(vm._loadWithoutCache);
	});
});
