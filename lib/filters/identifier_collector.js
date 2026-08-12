import Slm from "./slm.js";
import extractIdentifiers, {
	extractLocalDeclarations,
} from "../utils/extract_identifiers.js";

function IdentifierCollector() {}

const p = (IdentifierCollector.prototype = new Slm());

// Collect identifiers and local declarations from a code expression
p._collectIds = function (code) {
	if (this.options && this.options._identifiers) {
		const ids = extractIdentifiers(code, this.options.destructuringExclude);
		ids.forEach((id) => this.options._identifiers.add(id));
		const locals = extractLocalDeclarations(code);
		locals.forEach((id) => this.options._locals.add(id));
	}
};

p.on_slm_output = function (exps) {
	this._collectIds(exps[3]);
	return ["slm", "output", exps[2], exps[3], this.compile(exps[4])];
};

p.on_slm_control = function (exps) {
	this._collectIds(exps[2]);
	return ["slm", "control", exps[2], this.compile(exps[3])];
};

// Override base Slm: attribute values also contain identifiers to collect
p.on_slm_attrvalue = function (exps) {
	this._collectIds(exps[3]);
	return ["slm", "attrvalue", exps[2], exps[3]];
};

export default IdentifierCollector;
