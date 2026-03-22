import Filter from "../filter.js";

// Flattens nested multi expressions

function MultiFlattener() {}
MultiFlattener.prototype = new Filter();

MultiFlattener.prototype.on_multi = function (exps) {
	// If the multi contains a single element, just return the element
	const len = exps.length;
	if (len === 2) {
		return this.compile(exps[1]);
	}

	const res = ["multi"];

	for (let i = 1; i < len; i++) {
		let exp = exps[i];
		exp = this.compile(exp);
		if (exp[0] === "multi") {
			for (let j = 1, l = exp.length; j < l; j++) {
				res.push(exp[j]);
			}
		} else {
			res.push(exp);
		}
	}

	return res;
};

export default MultiFlattener;
