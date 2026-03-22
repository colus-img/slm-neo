function Engine() {
	this._chain = [];
}

const p = Engine.prototype;

p.use = function (filter) {
	this._chain.push(filter);
};

p.exec = function (src, options) {
	let res = src;
	for (let i = 0, li = this._chain.length; i < li; i++) {
		res = this._chain[i].exec(res, options);
	}

	return res;
};

export default Engine;
