var SlmVM = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // lib/vm_browser.js
  var vm_browser_exports = {};
  __export(vm_browser_exports, {
    VMBrowser: () => VMBrowser,
    default: () => vm_browser_default
  });

  // lib/vm.js
  var ampRe = /&/g;
  var escapeRe = /[&<>"]/;
  var gtRe = />/g;
  var ltRe = /</g;
  var quotRe = /"/g;
  function SafeStr(val) {
    this.htmlSafe = true;
    this._val = val;
  }
  SafeStr.prototype.toString = function() {
    return this._val;
  };
  function safe(val) {
    if (!val || val.htmlSafe) {
      return val;
    }
    return new SafeStr(val);
  }
  function j(val) {
    const str = `${JSON.stringify(val)}`;
    return str.replace(/<\//g, "<\\/");
  }
  function escape(str) {
    if (typeof str !== "string") {
      if (!str) {
        return "";
      }
      if (str.htmlSafe) {
        return str.toString();
      }
      str = str.toString();
    }
    if (escapeRe.test(str)) {
      if (str.includes("&")) {
        str = str.replace(ampRe, "&amp;");
      }
      if (str.includes("<")) {
        str = str.replace(ltRe, "&lt;");
      }
      if (str.includes(">")) {
        str = str.replace(gtRe, "&gt;");
      }
      if (str.includes('"')) {
        str = str.replace(quotRe, "&quot;");
      }
    }
    return str;
  }
  function rejectEmpty(arr) {
    const res = [];
    for (let i = 0, l = arr.length; i < l; i++) {
      const el = arr[i];
      if (el !== null && el !== void 0 && el !== "") {
        res.push(el);
      }
    }
    return res;
  }
  function flatten(arr, stringify = true) {
    return arr.reduce((acc, val) => {
      if (val === null || val === void 0) {
        return acc;
      }
      if (Array.isArray(val)) {
        return acc.concat(flatten(val, stringify));
      }
      acc.push(stringify && val && val.toString ? val.toString() : val);
      return acc;
    }, []);
  }
  VM._cache = {};
  function VM() {
    this.reset();
    this.template = this.basePath = null;
    this._cache = VM._cache;
  }
  var VMProto = VM.prototype;
  VM.escape = VMProto.escape = escape;
  VM.safe = VMProto.safe = safe;
  VM.yieldBlock = function(context, cb, next) {
    const res = cb.call(context);
    if (res && typeof res.then === "function") {
      return res.then(next);
    }
    return next(res);
  };
  VMProto.j = j;
  VMProto.flatten = flatten;
  VMProto.rejectEmpty = rejectEmpty;
  VMProto.resetCache = function() {
    this._cache = VM._cache = {};
  };
  VMProto.cache = function(name, value) {
    this._cache[name] = value;
  };
  VMProto.rebind = function() {
    this._content = this.content.bind(this);
    this._extend = this.extend.bind(this);
    this._partial = this.partial.bind(this);
    this._mixin = this.mixin.bind(this);
    this._yield = this.yieldBlock.bind(this);
  };
  VMProto._resolve = function(val, next) {
    if (val && typeof val.then === "function") {
      return val.then(next);
    }
    return next(val);
  };
  VMProto._loadWithCache = function(path) {
    const fn = this._cache[path];
    if (fn) {
      return fn;
    }
    const result = this._cache[path] = this._loadWithoutCache(path);
    return result;
  };
  VMProto._load = VMProto._loadWithCache;
  VMProto.reset = function() {
    this._contents = {};
    this._mixins = {};
    this.res = "";
    this.stack = [];
    this.m = null;
  };
  VMProto.pop = function(sp) {
    const currentFilename = this.filename;
    let l = this.stack.length;
    while (sp < l--) {
      this.filename = this.stack.pop();
      this._load(this.filename).call(this.m, this);
    }
    this.filename = currentFilename;
    return this.res;
  };
  VMProto.extend = function(path) {
    this.stack.push(this._resolvePath(path));
  };
  VMProto.partial = function(path, model, cb) {
    const stashedResult = this.res;
    if (cb) {
      this.res = cb.call(this.m, this);
    }
    if (model === void 0) {
      model = this.m;
    }
    path = this._resolvePath(path);
    const f = this._load(path), stashedFilename = this.filename, stashedModel = this.m;
    this.filename = path;
    const res = safe(f.call(this.m = model, this));
    this.m = stashedModel;
    this.filename = stashedFilename;
    this.res = stashedResult;
    return res;
  };
  VMProto.content = function(...args) {
    const [name, second, third] = args;
    switch (args.length) {
      case 0: {
        if (!this.res && this.m) {
          const fallback = this.m[this.contentName];
          if (fallback !== void 0 && fallback !== null) {
            return safe(typeof fallback === "function" ? fallback() : fallback);
          }
        }
        return safe(this.res);
      }
      case 1:
        return safe(this._contents[name] || "");
      case 2: {
        const cb = second;
        if (!name) return cb.call(this.m);
        return this._resolve(cb.call(this.m), (h) => {
          this._contents[name] = h;
          return "";
        });
      }
      case 3: {
        const mod = second;
        const cb = third;
        const contents = this._contents[name] || "";
        switch (mod) {
          case "default": {
            if (contents) return safe(contents);
            return this._resolve(cb.call(this.m), safe);
          }
          case "append":
            return this._resolve(cb.call(this.m), (h) => {
              this._contents[name] = contents + h;
              return "";
            });
          case "prepend":
            return this._resolve(cb.call(this.m), (h) => {
              this._contents[name] = h + contents;
              return "";
            });
        }
      }
    }
  };
  VMProto.yieldBlock = function(cb, next) {
    return VM.yieldBlock(this.m, cb, next);
  };
  VMProto.mixin = function(...args) {
    const [name] = args;
    const lastArgument = args[args.length - 1];
    if (typeof lastArgument === "function") {
      const cb = lastArgument;
      const mixinArgs = [];
      for (let i = 1; i < args.length - 1; i++) {
        let paramName = args[i];
        let defaultValue = null;
        const m = paramName.match(/([^\=\s]*)\s*\=\s*(.*)/);
        if (m) {
          paramName = m[1];
          defaultValue = m[2];
        }
        mixinArgs.push({ name: paramName, value: defaultValue });
      }
      if (name) {
        this._mixins[name] = {
          arguments: mixinArgs,
          body: cb
        };
      }
      return "";
    }
    const referenceParams = args.slice(1);
    let mixin = null;
    for (const item in this._mixins) {
      if (item === name) {
        const maybeMixin = this._mixins[item];
        let mixinStatus = true;
        for (let i = referenceParams.length; i < maybeMixin.arguments.length; i++) {
          const param = maybeMixin.arguments[i];
          if (!param.value) {
            mixinStatus = false;
            break;
          }
        }
        if (mixinStatus) {
          mixin = maybeMixin;
          break;
        }
      }
    }
    if (!mixin) {
      return "";
    }
    const mixinParams = mixin.arguments;
    if (referenceParams.length !== mixinParams.length) {
      for (let i = referenceParams.length; i < mixinParams.length; i++) {
        referenceParams.push(mixinParams[i].value);
      }
    }
    const params = {};
    for (let i = 0; i < referenceParams.length; i++) {
      params[mixinParams[i].name] = referenceParams[i];
    }
    const mergedParams = {};
    if (this.m) {
      Object.assign(mergedParams, this.m);
    }
    Object.assign(mergedParams, params);
    return mixin.body.apply(mergedParams, [this]);
  };
  var vm_default = VM;

  // lib/vm_browser.js
  function VMBrowser() {
    vm_default.call(this);
  }
  var p = VMBrowser.prototype = new vm_default();
  p.runInContext = (src, filename) => {
    if (filename) {
      src += `
//# sourceURL=${filename}`;
    }
    return eval(src);
  };
  p._resolvePath = () => {
  };
  var vm_browser_default = VMBrowser;
  return __toCommonJS(vm_browser_exports);
})();
