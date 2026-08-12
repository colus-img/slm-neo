import VM from "../../lib/vm.js";

export const assertHtml = (template, src, result, options, extendContext) => {
	if (Array.isArray(src)) {
		src = src.join("\n");
	}

	const env = {};
	const getContext = () =>
		Object.assign(
			{
				items: [1, 2, 3],
				idHelper: "notice",
				outputNumber: 1337,
				helloWorld: "Hello World from @env",
				_resolve(val, next) {
					if (val && typeof val.then === "function") {
						return val.then(next);
					}
					return next(val);
				},
				showFirst(force) {
					if (force !== undefined) {
						return force;
					}
					return false;
				},
				x: 0,
				message(m1, m2) {
					if (!m2) {
						return m1;
					}
					return [m1, m2].join(" ");
				},
				helloBlock(callback) {
					return this._resolve(
						callback.call(this),
						(res) => `${this.helloWorld} ${res} ${this.helloWorld}`,
					);
				},
				block(callback) {
					return this._resolve(callback.call(this), VM.safe);
				},
				async block_async(callback) {
					return VM.safe(await callback());
				},
				content(...args) {
					const [name, second, third] = args;
					switch (args.length) {
						case 0:
							return VM.safe(env[""] || "");
						case 1:
							return VM.safe(env[name] || "");
						case 2: {
							const cb = second;
							if (!name) return cb.call(this);
							return this._resolve(cb.call(this), (h) => {
								env[name] = h;
								return "";
							});
						}
						case 3: {
							const mod = second;
							const cb = third;
							const contents = env[name] || "";
							switch (mod) {
								case "default":
									if (contents) return VM.safe(contents);
									return this._resolve(cb.call(this), VM.safe);
								case "append":
									return this._resolve(cb.call(this), (h) => {
										env[name] = contents + h;
										return "";
									});
								case "prepend":
									return this._resolve(cb.call(this), (h) => {
										env[name] = h + contents;
										return "";
									});
							}
						}
					}
				},
				evilMethod() {
					return "<script>do_something_evil();</script>";
				},
			},
			extendContext || {},
		);

	options = options || {};

	// (1) Synchronous Check (Skip if asyncOnly is true)
	if (!options.asyncOnly) {
		const syncResult = template.render(src, getContext(), options);
		expect(syncResult).toEqual(result);
	}

	// (2) Asynchronous Check (Skip if syncOnly is true)
	if (!options.syncOnly) {
		return template
			.renderAsync(src, getContext(), options)
			.then((asyncResult) => {
				expect(asyncResult).toEqual(result);
			});
	}
};

export const assertSyntaxError = (template, src, result, options) => {
	if (Array.isArray(src)) {
		src = src.join("\n");
	}

	const getContext = () => ({
		idHelper: "notice",
		outputNumber: 1337,
		helloWorld: "Hello World from @env",
		showFirst(force) {
			if (force !== undefined) {
				return force;
			}
			return false;
		},
		x: 0,
		message(v) {
			return v;
		},
		helloBlock(callback) {
			return `${this.helloWorld} ${callback()} ${this.helloWorld}`;
		},
	});

	options = options || {};

	// (1) Sync error check
	if (!options.asyncOnly) {
		expect(() => {
			template.render(src, getContext(), options);
		}).toThrow(result);
	}

	// (2) Async error check
	if (!options.syncOnly) {
		const p = (async () => {
			return template.renderAsync(src, getContext(), options);
		})();
		return expect(p).rejects.toThrow(result);
	}
};
