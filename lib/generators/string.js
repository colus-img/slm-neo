import Generator from "../generator.js";

function StringGenerator(name, initializer) {
	this._buffer = name || "_b";
	this._initializer = initializer;
}
const p = (StringGenerator.prototype = new Generator());

p.preamble = function () {
	return this._initializer ? this._initializer : `var ${this._buffer}='';`;
};

p.on_capture = function (exps) {
	const generator = new StringGenerator(exps[1], exps[2]);
	generator._dispatcher = this._dispatcher;
	return generator.exec(exps[3]);
};

export default StringGenerator;
