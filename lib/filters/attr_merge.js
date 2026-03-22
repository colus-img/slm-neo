import Slm from "./slm.js";

function AttrMerge(mergeAttrs) {
	this._mergeAttrs = mergeAttrs;
}

const p = (AttrMerge.prototype = new Slm());

p.on_html_attrs = function (exps) {
	const names = [],
		values = {};
	for (let i = 2, l = exps.length; i < l; i++) {
		const attr = exps[i];
		const name = attr[2].toString(),
			val = attr[3];
		if (values[name]) {
			if (!this._mergeAttrs[name]) {
				throw new Error(`Multiple ${name} attributes specified`);
			}

			values[name].push(val);
		} else {
			values[name] = [val];
			names.push(name);
		}
	}

	names.sort();

	return this._merge(names, values);
};

p._merge = function (names, values) {
	const attrs = [];
	for (let i = 0, il = names.length; i < il; i++) {
		const name = names[i];
		const value = values[name],
			delimiter = this._mergeAttrs[name];
		if (delimiter && value.length > 1) {
			let all = false;
			const exp = ["multi"];
			for (let k = 0, kl = value.length; k < kl; k++) {
				const kv = value[k];
				all = this._isContainNonEmptyStatic(kv);
				if (!all) {
					break;
				}
			}
			if (all) {
				for (let j = 0, jl = value.length; j < jl; j++) {
					const jv = value[j];
					if (j) {
						exp.push(["static", delimiter]);
					}
					exp.push(jv);
				}
				attrs[i] = ["html", "attr", name, exp];
			} else {
				const captures = this._uniqueName();
				exp.push(["code", `var ${captures}=[];`]);
				for (let a = 0, al = value.length; a < al; a++) {
					exp.push([
						"capture",
						`${captures}[${a}]`,
						`${captures}[${a}]='';`,
						value[a],
					]);
				}
				exp.push([
					"dynamic",
					`vm.rejectEmpty(${captures}).join("${delimiter}")`,
				]);
				attrs[i] = ["html", "attr", name, exp];
			}
		} else {
			attrs[i] = ["html", "attr", name, value[0]];
		}
	}

	return ["html", "attrs"].concat(attrs);
};

export default AttrMerge;
