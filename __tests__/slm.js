import VMNode from "../lib/vm_node.js";
import Template from "../lib/template.js";
import slm from "../lib/slm.js";
import FS from "node:fs";
import { jest } from "@jest/globals";

describe("SLM core Express integration", () => {
	beforeEach(() => {
		// Reset cache before each test
		slm.__cache = null;

		// Mock FS.readFile
		jest.spyOn(FS, "readFile").mockImplementation((path, encoding, cb) => {
			if (path === "error.slm") {
				return cb("File read error");
			}
			cb(null, "p Hello ${this.name}");
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test("expressOpts returns __express", () => {
		const expressFn = slm.expressOpts({});
		expect(expressFn).toBe(slm.__express);
	});

	test("__express renders template successfully", (done) => {
		slm.__express(
			"test.slm",
			{ name: "World", views: "/" },
			(err, rendered) => {
				try {
					expect(err).toBeNull();
					expect(rendered).toBe("<p>Hello World</p>");
					done();
				} catch (e) {
					done(e);
				}
			},
		);
	});

	test("__express returns error if FS.readFile fails", (done) => {
		slm.__express("error.slm", {}, (err, rendered) => {
			try {
				expect(err).toBeInstanceOf(Error);
				expect(err.message).toBe("File read error");
				done();
			} catch (e) {
				done(e);
			}
		});
	});

	test("__express uses cache on second render", (done) => {
		slm.__express(
			"cached.slm",
			{ name: "First", cache: true, views: "/" },
			(err1, rendered1) => {
				try {
					expect(err1).toBeNull();
					expect(rendered1).toBe("<p>Hello First</p>");

					jest
						.spyOn(FS, "readFile")
						.mockImplementation((path, encoding, cb) => {
							cb(null, "p Not Used");
						});

					slm.__express(
						"cached.slm",
						{ name: "Second", cache: true, views: "/" },
						(err2, rendered2) => {
							try {
								expect(err2).toBeNull();
								expect(rendered2).toBe("<p>Hello Second</p>");
								done();
							} catch (e) {
								done(e);
							}
						},
					);
				} catch (e) {
					done(e);
				}
			},
		);
	});

	test("__express catches compilation error", (done) => {
		jest.spyOn(FS, "readFile").mockImplementation((path, encoding, cb) => {
			cb(null, "= this.block("); // Missing parenthesis closure to throw CompileError
		});

		slm.__express("compile_error.slm", {}, (err, rendered) => {
			try {
				expect(err.message).toContain("missing )");
				expect(rendered).toBeNull();
				done();
			} catch (e) {
				done(e);
			}
		});
	});
});
