import VM from "../lib/vm.js";
import { jest } from "@jest/globals";

describe("VM", () => {
	const vm = new VM();

	test(".rejectEmpty()", () => {
		expect(vm.rejectEmpty(["a", null, "b", "", "c"])).toEqual(["a", "b", "c"]);
	});

	test(".flatten()", () => {
		expect(vm.flatten([1, [2, 3], [4, [5, [6, 7]]]])).toEqual([
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
		]);

		expect(vm.flatten([1, 2, [3], [4, [5, 6], 7], [8, 9]])).toEqual([
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
		]);

		expect(vm.flatten([1, 2, [], [3, [4, 5, []], 6]])).toEqual([
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
		]);
	});

	test(".escape()", () => {
		expect(vm.escape()).toEqual("");
		expect(vm.escape(null)).toEqual("");
		expect(vm.escape(" ")).toEqual(" ");
		expect(vm.escape("<")).toEqual("&lt;");
		expect(vm.escape(">")).toEqual("&gt;");
		expect(vm.escape('"')).toEqual("&quot;");
		expect(vm.escape("&")).toEqual("&amp;");
		expect(vm.escape('<javascript>alert("alert!")</javascript>')).toEqual(
			"&lt;javascript&gt;alert(&quot;alert!&quot;)&lt;/javascript&gt;",
		);
	});

	test(".safe()", () => {
		expect(
			vm.escape(vm.safe('<javascript>alert("alert!")</javascript>')),
		).toEqual('<javascript>alert("alert!")</javascript>');
		expect(vm.escape(vm.safe(""))).toEqual("");
		expect(vm.escape(vm.safe())).toEqual("");
		expect(vm.escape(vm.safe(null))).toEqual("");
	});

	test(".content() fallback", () => {
		vm.reset();
		vm.m = { content: "Fallback Content" };
		vm.contentName = "content";
		expect(vm.content().toString()).toEqual("Fallback Content");

		vm.m = { my_body: "Custom Prop" };
		vm.contentName = "my_body";
		expect(vm.content().toString()).toEqual("Custom Prop");

		vm.m = { content: () => "From Function" };
		vm.contentName = "content";
		expect(vm.content().toString()).toEqual("From Function");

		vm.res = "Priority";
		expect(vm.content().toString()).toEqual("Priority");
		vm.reset();
	});

	test(".yieldBlock()", async () => {
		const nextSync = jest.fn((res) => "Next: " + res);
		const cbSync = jest.fn(function () {
			return "SyncRes";
		});

		vm.m = { prop: "val" };
		const resSync = vm.yieldBlock(cbSync, nextSync);
		expect(cbSync).toHaveBeenCalled();
		expect(nextSync).toHaveBeenCalledWith("SyncRes");
		expect(resSync).toBe("Next: SyncRes");

		const nextAsync = jest.fn((res) => "Next Async: " + res);
		const cbAsync = jest.fn(async function () {
			return "AsyncRes";
		});

		const resAsync = vm.yieldBlock(cbAsync, nextAsync);
		expect(resAsync).toBeInstanceOf(Promise);
		expect(await resAsync).toBe("Next Async: AsyncRes");
	});

	test(".content() with explicit null/undefined fallback", () => {
		vm.reset();
		vm.contentName = "content";
		expect(vm.content(undefined).toString()).toEqual("");
		expect(vm.content(null).toString()).toEqual("");
	});

	test("mixin definition and reference edge cases", () => {
		// Branches: name is falsy, required param without default, missing mixin throw
		vm.mixin("", () => "no name");
		vm.mixin("reqParam", "a", () => "called");
		vm.mixin("anotherMixin", () => "called2");
		vm.m = null; // covers if (this.m) false branch when calling valid mixin
		expect(vm.mixin("anotherMixin")).toBe("called2");

		expect(vm.mixin("reqParam")).toBe("");
		expect(vm.mixin("unknownMixin")).toBe("");
	});
});
