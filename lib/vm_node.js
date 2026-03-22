import FS from "node:fs";
import NodeVM from "node:vm";
import Path from "node:path";
import VM from "./vm.js";

function VMNode() {
	VM.call(this);
}

const p = (VMNode.prototype = new VM());

p.runInContext = NodeVM.runInThisContext;

p._loadWithoutCache = function (path) {
	const src = FS.readFileSync(path, "utf8");
	return this.runInContext(
		this.template.src(src, { filename: this.filename }),
		this.filename,
	)[0];
};

p._resolvePath = function (path) {
	const basename = Path.basename,
		dirname = Path.dirname,
		join = Path.join;

	if (path[0] !== "/" && !this.filename) {
		throw new Error(
			'the "filename" option is required to use with "relative" paths',
		);
	}

	if (path[0] === "/" && !this.basePath) {
		throw new Error(
			'the "basePath" option is required to use with "absolute" paths',
		);
	}

	path = join(path[0] === "/" ? this.basePath : dirname(this.filename), path);

	if (!basename(path).includes(".")) {
		path += ".slm";
	}

	return path;
};

export default VMNode;
