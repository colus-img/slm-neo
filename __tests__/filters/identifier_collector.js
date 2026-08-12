import IdentifierCollector from "../../lib/filters/identifier_collector.js";

describe("IdentifierCollector", () => {
	it("should safely ignore missing options or _identifiers", () => {
		const collector = new IdentifierCollector();
		// Since no options provided, it shouldn't throw
		expect(() => collector._collectIds("const x = 1")).not.toThrow();

		collector.options = {};
		expect(() => collector._collectIds("const x = 1")).not.toThrow();
	});
});
