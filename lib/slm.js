import Template from "./template.js";
import VMNode from "./vm_node.js";
let template = new Template(VMNode);

import FS from "node:fs";

let slm = template.exports();

export default slm;

slm.__express = (path, options, fn) => {
	FS.readFile(path, "utf-8", (err, src) => {
		if (err) {
			return fn(new Error(err));
		}
		const compile = slm.compile;
		const compileOptions = {};
		compileOptions.useCache = options.cache;
		compileOptions.basePath = options.views;
		compileOptions.filename = path;

		if (!slm.__cache) {
			slm.__cache = {};
		}

		try {
			let compiled = slm.__cache[path];

			if (compiled && options.cache) {
				return fn(null, compiled(options, compileOptions));
			}

			compiled = compile(src, compileOptions);
			const rendered = compiled(options, compileOptions);
			slm.__cache[path] = compiled;
			fn(null, rendered);
		} catch (e) {
			fn(e, null);
		}
	});
};

/*
  This allows us to pass ExpressJS some options
  Note: Should only be used to initialise Slm.
*/
slm.expressOpts = function (options) {
	template = new Template(VMNode, options);
	slm = template.exports();
	return this.__express;
};
