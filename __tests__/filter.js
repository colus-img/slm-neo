import Filter from "../lib/filter.js";

describe("Filter", () => {
	function FilterWithOnA() {}
	FilterWithOnA.prototype = new Filter();
	(function () {
		this.on_a = () => ["a"];

		this.on_a_b = (exps) => ["a", "b", exps[2]];
	}).apply(FilterWithOnA.prototype);

	function TestFilter() {}
	TestFilter.prototype = new Filter();
	(function () {
		this.on_test = (exps) => ["on_test"].concat(exps[1]);

		this.on_test_check = (exps) => ["on_check"].concat(exps[2]);

		this.on_second_test = (exps) => ["on_second_test"].concat(exps[2]);

		this.on_a_b = (exps) => {
			exps.shift();
			exps.shift();
			return ["on_ab"].concat(exps);
		};

		this.on_a_b_test = (exps) => ["on_ab_test"].concat(exps[3]);

		this.on_a_b_c_d_test = (exps) => ["on_abcd_test"].concat(exps[5]);
	}).apply(TestFilter.prototype);

	function InheritedTestFilter() {}
	InheritedTestFilter.prototype = new TestFilter();

	InheritedTestFilter.prototype.on = (args) => ["on_zero"].concat(args);

	let filter;

	beforeEach(() => {
		filter = new TestFilter();
	});

	test("#dispatchedMethods", () => {
		const filter = new Filter();
		expect(filter._dispatchedMethods()).toEqual([
			"on_multi",
			"on_capture",
			"on_if",
			"on_switch",
			"on_block",
			"on_escape",
		]);

		const filterWithOnA = new FilterWithOnA();

		expect(filterWithOnA._dispatchedMethods()).toEqual([
			"on_a",
			"on_a_b",
			"on_multi",
			"on_capture",
			"on_if",
			"on_switch",
			"on_block",
			"on_escape",
		]);
	});

	test("return unhandled expressions", () => {
		expect(filter.exec(["unhandled"])).toEqual(["unhandled"]);
	});

	test("dispatch first level", () => {
		expect(filter.exec(["test", 42])).toEqual(["on_test", 42]);
	});

	test("dispatch second level", () => {
		expect(filter.exec(["second", "test", 42])).toEqual(["on_second_test", 42]);
	});

	test("dispatch second level if prefixed", () => {
		expect(filter.exec(["test", "check", 42])).toEqual(["on_check", 42]);
	});

	test("dispatch parent level", () => {
		expect(filter.exec(["a", 42])).toEqual(["a", 42]);
		expect(filter.exec(["a", "b", 42])).toEqual(["on_ab", 42]);
		expect(filter.exec(["a", "b", "test", 42])).toEqual(["on_ab_test", 42]);
		expect(filter.exec(["a", "b", "c", 42])).toEqual(["on_ab", "c", 42]);
		expect(filter.exec(["a", "b", "c", "d", 42])).toEqual([
			"on_ab",
			"c",
			"d",
			42,
		]);
		expect(filter.exec(["a", "b", "c", "d", "test", 42])).toEqual([
			"on_abcd_test",
			42,
		]);
	});
});
