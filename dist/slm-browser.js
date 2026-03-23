var Slm = (() => {
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
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // lib/slm_browser.js
  var slm_browser_exports = {};
  __export(slm_browser_exports, {
    compile: () => compile,
    compileAsync: () => compileAsync,
    default: () => slm_browser_default,
    render: () => render,
    renderAsync: () => renderAsync
  });

  // lib/custom_require_browser.js
  var customRequire = null;

  // lib/dispatcher.js
  var methodSplitRE = /_/;
  var methodRE = /^on(_\w+)*$/;
  function Node() {
    this._nodes = {};
  }
  Node.prototype.compile = function(level, callMethod) {
    if (this._method) {
      callMethod = `this.${this._method}(exps)`;
    }
    let code = `switch(exps[${level}]) {`;
    let empty = true;
    for (const key in this._nodes) {
      empty = false;
      code += `
case '${key}' : 
`;
      code += `${this._nodes[key].compile(level + 1, callMethod)};`;
    }
    if (empty) {
      return `return ${callMethod}`;
    }
    code += `
default:
return ${callMethod || "exps"};}`;
    return code;
  };
  function Dispatcher() {
  }
  var DispatcherProto = Dispatcher.prototype;
  DispatcherProto.exec = function(exp) {
    return this.compile(exp);
  };
  DispatcherProto.compile = function(exp) {
    return this._dispatcher(exp);
  };
  DispatcherProto._dispatcher = function(exp) {
    return this._replaceDispatcher(exp);
  };
  DispatcherProto._dispatchedMethods = function() {
    const res = [];
    for (const key in this) {
      if (methodRE.test(key)) {
        res.push(key);
      }
    }
    return res;
  };
  DispatcherProto._replaceDispatcher = function(exp) {
    const tree = new Node();
    const dispatchedMethods = this._dispatchedMethods();
    for (let i = 0, il = dispatchedMethods.length; i < il; i++) {
      const method = dispatchedMethods[i];
      let node = tree;
      const types = method.split(methodSplitRE);
      for (let j2 = 1, jl = types.length; j2 < jl; j2++) {
        const type = types[j2];
        const n = node._nodes[type];
        node = node._nodes[type] = n || new Node();
      }
      node._method = method;
    }
    this._dispatcher = new Function("exps", tree.compile(0));
    return this._dispatcher(exp);
  };
  var dispatcher_default = Dispatcher;

  // lib/filter.js
  function Filter() {
  }
  var p = Filter.prototype = new dispatcher_default();
  var uniqueName = 0;
  p._isEmptyExp = function(exp) {
    switch (exp[0]) {
      case "multi":
        for (let i = 1, l = exp.length; i < l; i++) {
          if (!this._isEmptyExp(exp[i])) {
            return false;
          }
        }
        return true;
      case "newline":
        return true;
      default:
        return false;
    }
  };
  p._uniqueName = () => {
    uniqueName++;
    return `$lm${uniqueName.toString(16)}`;
  };
  p._compileEach = function(exps, startIndex) {
    for (let i = startIndex, l = exps.length; i < l; i++) {
      exps[i] = this.compile(exps[i]);
    }
    return exps;
  };
  p._shiftAndCompile = function(exps) {
    return this._compileEach(exps, 2);
  };
  p.on_multi = function(exps) {
    return this._compileEach(exps, 1);
  };
  p.on_capture = function(exps) {
    return ["capture", exps[1], exps[2], this.compile(exps[3])];
  };
  p.on_if = p._shiftAndCompile;
  p._shiftAndCompileMulti = function(exps) {
    const res = ["multi"];
    for (let i = 2, l = exps.length; i < l; i++) {
      res.push(this.compile(exps[i]));
    }
    return res;
  };
  p.on_switch = function(exps) {
    for (let i = 2, l = exps.length; i < l; i++) {
      const exp = exps[i];
      exps[i] = [exp[0], this.compile(exp[1])];
    }
    return exps;
  };
  p.on_block = function(exps) {
    return ["block", exps[1], this.compile(exps[2])];
  };
  p.on_escape = function(exps) {
    return ["escape", exps[1], this.compile(exps[2])];
  };
  var filter_default = Filter;

  // lib/html/html.js
  function Html() {
  }
  var p2 = Html.prototype = new filter_default();
  p2.on_html_attrs = p2._shiftAndCompile;
  p2.on_html_attr = function(exps) {
    return ["html", "attr", exps[2], this.compile(exps[3])];
  };
  p2.on_html_comment = function(exps) {
    return ["html", "comment", this.compile(exps[2])];
  };
  p2.on_html_condcomment = function(exps) {
    return ["html", "condcomment", exps[2], this.compile(exps[3])];
  };
  p2.on_html_tag = function(exps) {
    const content = exps[4];
    const res = ["html", "tag", exps[2], this.compile(exps[3])];
    if (content) {
      res.push(this.compile(content));
    }
    return res;
  };
  p2._isContainNonEmptyStatic = function(exp) {
    switch (exp[0]) {
      case "multi":
        for (let i = 1, l = exp.length; i < l; i++) {
          if (this._isContainNonEmptyStatic(exp[i])) {
            return true;
          }
        }
        return false;
      case "escape":
        return this._isContainNonEmptyStatic(exp[exp.length - 1]);
      case "static":
        return exp[1].length;
      default:
        return false;
    }
  };
  var html_default = Html;

  // lib/filters/slm.js
  function Slm() {
  }
  var p3 = Slm.prototype = new html_default();
  p3.on_slm_text = function(exps) {
    exps[2] = this.compile(exps[2]);
    return exps;
  };
  p3.on_slm_control = function(exps) {
    exps[3] = this.compile(exps[3]);
    return exps;
  };
  p3.on_slm_output = function(exps) {
    exps[4] = this.compile(exps[4]);
    return exps;
  };
  var slm_default = Slm;

  // lib/filters/attr_merge.js
  function AttrMerge(mergeAttrs) {
    this._mergeAttrs = mergeAttrs;
  }
  var p4 = AttrMerge.prototype = new slm_default();
  p4.on_html_attrs = function(exps) {
    const names = [], values = {};
    for (let i = 2, l = exps.length; i < l; i++) {
      const attr = exps[i];
      const name = attr[2].toString(), val = attr[3];
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
  p4._merge = function(names, values) {
    const attrs = [];
    for (let i = 0, il = names.length; i < il; i++) {
      const name = names[i];
      const value = values[name], delimiter = this._mergeAttrs[name];
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
          for (let j2 = 0, jl = value.length; j2 < jl; j2++) {
            const jv = value[j2];
            if (j2) {
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
              value[a]
            ]);
          }
          exp.push([
            "dynamic",
            `vm.rejectEmpty(${captures}).join("${delimiter}")`
          ]);
          attrs[i] = ["html", "attr", name, exp];
        }
      } else {
        attrs[i] = ["html", "attr", name, value[0]];
      }
    }
    return ["html", "attrs"].concat(attrs);
  };
  var attr_merge_default = AttrMerge;

  // lib/filters/attr_remove.js
  function AttrRemove(removeEmptyAttrs) {
    this._removeEmptyAttrs = removeEmptyAttrs;
  }
  AttrRemove.prototype = new slm_default();
  AttrRemove.prototype.on_html_attr = function(exps) {
    const name = exps[2], value = exps[3];
    if (this._removeEmptyAttrs[name.toString()] === void 0) {
      return slm_default.prototype.on_html_attr.call(this, exps);
    }
    if (this._isContainNonEmptyStatic(value)) {
      return ["html", "attr", name, value];
    }
    const tmp = this._uniqueName();
    return [
      "multi",
      ["capture", tmp, `var ${tmp}='';`, this.compile(value)],
      ["if", `${tmp}.length`, ["html", "attr", name, ["dynamic", tmp]]]
    ];
  };
  var attr_remove_default = AttrRemove;

  // lib/filters/brackets.js
  var blockRe = /^(case|default)\b/;
  var wrapCondRe = /^(for|switch|catch|while|if|else\s+if)\s+(?!\()((\S|\s\S)*)\s*$/;
  var ifRe = /^(if|switch|while|for|else|finally|catch)\b/;
  var callbackRe = /(function\s*\([^\)]*\)\s*)[^\{]/;
  function Brackets() {
  }
  var p5 = Brackets.prototype = new slm_default();
  p5.on_slm_control = function(exps) {
    let code = exps[2];
    const content = exps[3];
    let m;
    m = wrapCondRe.exec(code);
    if (m) {
      code = code.replace(m[2], `(${m[2]})`);
    }
    code = this._expandCallback(code, content);
    return ["slm", "control", code, this.compile(content)];
  };
  p5.on_slm_output = function(exps) {
    let code = exps[3];
    const content = exps[4];
    code = this._expandCallback(code, content);
    return ["slm", "output", exps[2], code, this.compile(content)];
  };
  p5._expandCode = (code, postCode) => {
    let index;
    const m = callbackRe.exec(code);
    if (m) {
      index = m.index + m[1].length;
      postCode += code.slice(index);
      code = code.slice(0, index);
    } else if ((index = code.lastIndexOf(")")) !== -1) {
      const firstIndex = code.indexOf("(");
      if (firstIndex === -1) {
        throw new Error(`Missing open brace "(" in \`${code}\``);
      }
      const args = code.slice(firstIndex + 1, index);
      postCode += code.slice(index);
      code = code.slice(0, index);
      if (!/^\s*$/.test(args)) {
        code += ",";
      }
      code += "function()";
    }
    return [code, postCode];
  };
  p5._expandCallback = function(code, content) {
    if (blockRe.test(code) || this._isEmptyExp(content)) {
      return code;
    }
    let postCode = "}";
    if (!ifRe.test(code)) {
      const parts = this._expandCode(code, postCode);
      code = parts[0];
      postCode = parts[1];
    }
    code += "{";
    content.push(["code", postCode]);
    return code;
  };
  var brackets_default = Brackets;

  // lib/filters/code_attributes.js
  function CodeAttributes(mergeAttrs) {
    this._mergeAttrs = mergeAttrs;
  }
  var p6 = CodeAttributes.prototype = new slm_default();
  p6.on_html_attrs = p6._shiftAndCompileMulti;
  p6.on_html_attr = function(exps) {
    const name = exps[2], value = exps[3];
    if (value[0] === "slm" && value[1] === "attrvalue" && !this._mergeAttrs[name]) {
      const escape2 = value[2], code = value[3];
      switch (code) {
        case "true":
          return ["html", "attr", name, ["multi"]];
        case "false":
        case "null":
        case "undefined":
          return ["multi"];
        default:
          const tmp = this._uniqueName();
          return [
            "multi",
            ["code", `var ${tmp}=${code}`],
            [
              "switch",
              tmp,
              [
                "true",
                ["multi", ["html", "attr", name, ["multi"]], ["code", "break"]]
              ],
              ["false", ["multi"]],
              ["undefined", ["multi"]],
              ["null", ["code", "break"]],
              [
                "default",
                ["html", "attr", name, ["escape", escape2, ["dynamic", tmp]]]
              ]
            ]
          ];
      }
    } else {
      this._attr = name;
      return slm_default.prototype.on_html_attr.call(this, exps);
    }
  };
  p6.on_slm_attrvalue = function(exps) {
    const escape2 = exps[2], code = exps[3];
    const delimiter = this._mergeAttrs[this._attr];
    if (delimiter) {
      const tmp = this._uniqueName();
      return [
        "multi",
        ["code", `var ${tmp}=${code};`],
        [
          "if",
          `${tmp} instanceof Array`,
          [
            "multi",
            ["code", `${tmp}=vm.rejectEmpty(vm.flatten(${tmp}));`],
            ["escape", escape2, ["dynamic", `${tmp}.join("${delimiter}")`]]
          ],
          ["escape", escape2, ["dynamic", tmp]]
        ]
      ];
    }
    return ["escape", escape2, ["dynamic", code]];
  };
  var code_attributes_default = CodeAttributes;

  // lib/filters/control_flow.js
  function ControlFlow() {
  }
  var p7 = ControlFlow.prototype = new slm_default();
  p7.on_switch = function(exps) {
    const arg = exps[1], res = ["multi", ["code", `switch(${arg}){`]];
    for (let i = 2, l = exps.length; i < l; i++) {
      const exp = exps[i];
      res.push(["code", exp[0] === "default" ? "default:" : `case ${exp[0]}:`]);
      res.push(this.compile(exp[1]));
    }
    res.push(["code", "}"]);
    return res;
  };
  p7.on_if = function(exps) {
    const condition = exps[1], yes = exps[2], no = exps[3];
    const result = ["multi", ["code", `if(${condition}){`], this.compile(yes)];
    if (no) {
      result.push(["code", "}else{"]);
      result.push(this.compile(no));
    }
    result.push(["code", "}"]);
    return result;
  };
  p7.on_block = function(exps) {
    const code = exps[1], exp = exps[2];
    return ["multi", ["code", code], this.compile(exp)];
  };
  var control_flow_default = ControlFlow;

  // lib/filters/controls.js
  var ifRe2 = /^(if)\b|{\s*$/;
  function Control() {
  }
  var p8 = Control.prototype = new slm_default();
  p8.on_slm_control = function(exps) {
    return ["multi", ["code", exps[2]], this.compile(exps[3])];
  };
  p8.on_slm_output = function(exps) {
    const escape2 = exps[2];
    const code = exps[3];
    let content = exps[4];
    if (ifRe2.test(code)) {
      const tmp = this._uniqueName(), tmp2 = this._uniqueName();
      content = this.compile(content);
      content.splice(content.length - 1, 0, ["code", `return vm.safe(${tmp2});`]);
      return [
        "multi",
        // Capture the result of the code in a variable. We can't do
        // `[dynamic, code]` because it's probably not a complete
        // expression (which is a requirement for Temple).
        [
          "block",
          `var ${tmp}=${code}`,
          // Capture the content of a block in a separate buffer. This means
          // that `yield` will not output the content to the current buffer,
          // but rather return the output.
          //
          // The capturing can be disabled with the option :disable_capture.
          // Output code in the block writes directly to the output buffer then.
          // Rails handles this by replacing the output buffer for helpers.
          // options[:disable_capture] ? compile(content) : [:capture, unique_name, compile(content)]],
          ["capture", tmp2, `var ${tmp2}='';`, content]
        ],
        // Output the content.
        ["escape", "escape", ["dynamic", tmp]]
      ];
    }
    return ["multi", ["escape", escape2, ["dynamic", code]], content];
  };
  p8.on_slm_text = function(exps) {
    return this.compile(exps[2]);
  };
  var controls_default = Control;

  // lib/filters/embedded.js
  function TextCollector() {
  }
  var TextProto = TextCollector.prototype = new slm_default();
  TextProto.exec = function(exp) {
    this._collected = "";
    slm_default.prototype.exec.call(this, exp);
    return this._collected;
  };
  TextProto.on_slm_interpolate = function(exps) {
    this._collected += exps[2];
  };
  function Engine() {
    this._textCollector = new TextCollector();
  }
  var EngineProto = Engine.prototype = new slm_default();
  EngineProto.collectText = function(body) {
    return this._textCollector.exec(body);
  };
  function Javascript(options) {
    this._withType = options && options.typeAttribute;
  }
  Javascript.prototype = new Engine();
  Javascript.prototype.on_slm_embedded = function(exps) {
    const body = exps[3];
    if (this._withType) {
      return [
        "html",
        "tag",
        "script",
        [
          "html",
          "attrs",
          ["html", "attr", "type", ["static", "text/javascript"]]
        ],
        body
      ];
    }
    return ["html", "tag", "script", ["html", "attrs"], body];
  };
  function CSS() {
  }
  CSS.prototype = new Engine();
  CSS.prototype.on_slm_embedded = (exps) => {
    const body = exps[3];
    return [
      "html",
      "tag",
      "style",
      ["html", "attrs", ["html", "attr", "type", ["static", "text/css"]]],
      body
    ];
  };
  function Embedded() {
    this._engines = {};
  }
  var EmbeddedProto = Embedded.prototype = new slm_default();
  EmbeddedProto.register = function(name, filter) {
    this._engines[name] = filter;
  };
  EmbeddedProto.on_slm_embedded = function(exps) {
    const name = exps[2];
    const engine = this._engines[name];
    if (!engine) {
      throw new Error(`Embedded engine ${name} is not registered.`);
    }
    return this._engines[name].on_slm_embedded(exps);
  };
  var InterpolateEngine = function(renderer) {
    this.renderer = renderer;
  };
  var InterpolateProto = InterpolateEngine.prototype = new Engine();
  InterpolateProto.on_slm_embedded = function(exps) {
    const body = exps[3];
    const text = this.collectText(body);
    return ["multi", ["slm", "interpolate", this.renderer(text)]];
  };
  var embedded_default = {
    Embedded,
    Javascript,
    CSS,
    TextCollector,
    InterpolateEngine
  };

  // lib/engine.js
  function Engine2() {
    this._chain = [];
  }
  var p9 = Engine2.prototype;
  p9.use = function(filter) {
    this._chain.push(filter);
  };
  p9.exec = function(src2, options) {
    let res = src2;
    for (let i = 0, li = this._chain.length; i < li; i++) {
      res = this._chain[i].exec(res, options);
    }
    return res;
  };
  var engine_default = Engine2;

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
      if (el !== null && el.length) {
        res.push(el);
      }
    }
    return res;
  }
  function flatten(arr) {
    return arr.reduce((acc, val) => {
      if (val === null) {
        return acc;
      }
      return acc.concat(Array.isArray(val) ? flatten(val) : val.toString());
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
  VMProto.content = function() {
    let cb, mod, name;
    switch (arguments.length) {
      case 0:
        return safe(this.res);
      case 1:
        return safe(this._contents[arguments[0]] || "");
      case 2:
        name = arguments[0];
        cb = arguments[1];
        if (name) {
          this._contents[name] = cb.call(this.m);
          return "";
        }
        return cb.call(this.m);
      case 3:
        name = arguments[0];
        mod = arguments[1];
        cb = arguments[2];
        const contents = this._contents[name] || "";
        switch (mod) {
          case "default":
            return safe(contents || cb.call(this.m));
          case "append":
            this._contents[name] = contents + cb.call(this.m);
            return "";
          case "prepend":
            this._contents[name] = cb.call(this.m) + contents;
            return "";
        }
    }
  };
  VMProto.mixin = function() {
    const name = arguments[0];
    const lastArgument = arguments[arguments.length - 1];
    if (typeof lastArgument === "function") {
      const cb = lastArgument;
      const args = [];
      for (var i = 1; i < arguments.length - 1; i++) {
        var param = arguments[i];
        let defaultValue = null;
        const m = param.match(/([^\=\s]*)\s*\=\s*(.*)/);
        if (m) {
          param = m[1];
          defaultValue = m[2];
        }
        args.push({
          name: param,
          value: defaultValue
        });
      }
      if (name) {
        this._mixins[name] = {
          arguments: args,
          body: cb
        };
        return "";
      }
      return "";
    }
    const referenceParams = [];
    for (var i = 1; i < arguments.length; i++) {
      referenceParams.push(arguments[i]);
    }
    let mixin = null;
    for (var item in this._mixins) {
      if (item === name) {
        const maybeMixin = this._mixins[item];
        const paramsLength = maybeMixin.arguments.length;
        let mixinStatus = true;
        for (var i = referenceParams.length; i < maybeMixin.arguments.length; i++) {
          var param = maybeMixin.arguments[i];
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
      for (var i = referenceParams.length; i < mixinParams.length; i++) {
        if (mixinParams[i]) {
          referenceParams.push(mixinParams[i].value);
        }
      }
    }
    const params = {};
    for (var i = 0; i < referenceParams.length; i++) {
      params[mixinParams[i].name] = referenceParams[i];
    }
    if (this.m) {
      for (var item in this.m) {
        params[item] = this.m[item];
      }
    }
    return mixin.body.call(params);
  };
  var vm_default = VM;

  // lib/filters/escape.js
  function Escape() {
    this._disableEscape = false;
    this._escape = false;
    this._escaper = vm_default.escape;
  }
  var p10 = Escape.prototype = new filter_default();
  p10._escapeCode = (v) => `vm.escape(${v.replace(/;+$/, "")})`;
  p10.on_escape = function(exps) {
    const old = this.escape;
    this._escape = exps[1] && !this._disableEscape;
    try {
      return this.compile(exps[2]);
    } finally {
      this._escape = old;
    }
  };
  p10.on_static = function(exps) {
    return ["static", this._escape ? this._escaper(exps[1]) : exps[1]];
  };
  p10.on_dynamic = function(exps) {
    return ["dynamic", this._escape ? this._escapeCode(exps[1]) : exps[1]];
  };
  var escape_default = Escape;

  // lib/html/fast.js
  function Fast(format) {
    this._autoclose = "area base br col embed hr img input keygen link menuitem meta param source track wbr".split(
      /\s/
    );
    this._format = format || "xhtml";
    this._attrQuote = '"';
    this._jsWrapper = ["\n//<![CDATA[\n", "\n//]]>\n"];
  }
  var p11 = Fast.prototype = new html_default();
  p11.on_html_doctype = function(exps) {
    let type = exps[2];
    const html = "<!DOCTYPE html>";
    const DOCTYPES = {
      xml: {
        1.1: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
        5: html,
        html,
        basic: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
        frameset: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
        strict: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
        svg: '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
        transitional: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
      },
      html: {
        5: html,
        html,
        frameset: '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">',
        strict: '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">',
        transitional: '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">'
      }
    };
    DOCTYPES.xhtml = DOCTYPES.xml;
    type = type.toString().toLowerCase();
    let m, str;
    m = /^xml(\s+(.+))?$/.exec(type);
    if (m) {
      if (this._format === "html") {
        throw new Error("Invalid xml directive in html mode");
      }
      const w = this._attrQuote;
      str = `<?xml version=${w}1.0${w} encoding=${w}${m[2] || "utf-8"}${w} ?>`;
    } else {
      str = DOCTYPES[this._format][type];
      if (!str) {
        throw new Error(`Invalid doctype ${type}`);
      }
    }
    return ["static", str];
  };
  p11.on_html_comment = function(exps) {
    return [
      "multi",
      ["static", "<!--"],
      this.compile(exps[2]),
      ["static", "-->"]
    ];
  };
  p11.on_html_condcomment = function(exps) {
    return this.on_html_comment([
      "html",
      "comment",
      ["multi", ["static", `[${exps[2]}]>`], exps[3], ["static", "<![endif]"]]
    ]);
  };
  p11.on_html_tag = function(exps) {
    const name = exps[2].toString(), attrs = exps[3], content = exps[4];
    const closed = !content || this._isEmptyExp(content) && (this._format === "xml" || this._autoclose.includes(name));
    const res = [
      "multi",
      ["static", `<${name}`],
      this.compile(attrs),
      ["static", `${closed && this._format !== "html" ? " /" : ""}>`]
    ];
    if (content) {
      res.push(this.compile(content));
    }
    if (!closed) {
      res.push(["static", `</${name}>`]);
    }
    return res;
  };
  p11.on_html_attrs = p11._shiftAndCompileMulti;
  p11.on_html_attr = function(exps) {
    const name = exps[2], value = exps[3];
    if (this._format === "html" && this._isEmptyExp(value)) {
      return ["static", ` ${name}`];
    }
    return [
      "multi",
      ["static", ` ${name}=${this._attrQuote}`],
      this.compile(value),
      ["static", this._attrQuote]
    ];
  };
  p11.on_html_js = function(exps) {
    const content = exps[2];
    return [
      "multi",
      ["static", this._jsWrapper[0]],
      this.compile(content),
      ["static", this._jsWrapper[1]]
    ];
  };
  var fast_default = Fast;

  // lib/filters/interpolate.js
  var escapedInterpolationRe = /^\\\$\{/;
  var interpolationRe = /^\$\{/;
  var staticTextRe = /^([\$\\]?[^\$\\]*([\$\\][^\\\$\{][^\$\\]*)*)/;
  function Interpolate() {
  }
  var p12 = Interpolate.prototype = new slm_default();
  p12.on_slm_interpolate = function(exps) {
    let str = exps[2], m, code;
    const block = ["multi"];
    do {
      m = escapedInterpolationRe.exec(str);
      if (m) {
        block.push(["static", "${"]);
        str = str.slice(m[0].length);
        continue;
      }
      m = interpolationRe.exec(str);
      if (m) {
        const res = this._parseExpression(str.slice(m[0].length));
        str = res[0];
        code = res[1];
        const escape2 = code[0] !== "=";
        block.push([
          "slm",
          "output",
          escape2,
          escape2 ? code : code.slice(1),
          ["multi"]
        ]);
      } else {
        m = staticTextRe.exec(str);
        block.push(["static", m[0]]);
        str = str.slice(m[0].length);
      }
    } while (str.length);
    return block;
  };
  p12._parseExpression = (str) => {
    for (var count = 1, i = 0, l = str.length; i < l && count; i++) {
      if (str[i] === "{") {
        count++;
      } else if (str[i] === "}") {
        count--;
      }
    }
    if (count) {
      throw new Error("Text interpolation: Expected closing }");
    }
    return [str.slice(i), str.substring(0, i - 1)];
  };
  var interpolate_default = Interpolate;

  // lib/filters/multi_flattener.js
  function MultiFlattener() {
  }
  MultiFlattener.prototype = new filter_default();
  MultiFlattener.prototype.on_multi = function(exps) {
    const len = exps.length;
    if (len === 2) {
      return this.compile(exps[1]);
    }
    const res = ["multi"];
    for (let i = 1; i < len; i++) {
      let exp = exps[i];
      exp = this.compile(exp);
      if (exp[0] === "multi") {
        for (let j2 = 1, l = exp.length; j2 < l; j2++) {
          res.push(exp[j2]);
        }
      } else {
        res.push(exp);
      }
    }
    return res;
  };
  var multi_flattener_default = MultiFlattener;

  // lib/parser.js
  var attrDelimRe = /^\s*([\(\)\[\]])/;
  var blockExpressionRe = /^\s*:\s*/;
  var closedTagRe = /^\s*\/\s*/;
  var delimRe = /^[\(\[]/;
  var doctypeRe = /^doctype\b/i;
  var embededRe = /^(\w+):\s*$/;
  var emptyLineRe = /^\s*$/;
  var htmlCommentRe = /^\/!(\s?)/;
  var htmlConditionalCommentRe = /^\/\[\s*(.*?)\s*\]\s*$/;
  var indentRegex = /^[ \t]+/;
  var indentationRe = /^\s+/;
  var newLineRe = /\r?\n/;
  var nextLineRe = /[,\\]$/;
  var outputBlockRe = /^=(=?)([<>]*)/;
  var outputCodeRe = /^\s*=(=?)([<>]*)/;
  var tabRe = /\t/g;
  var textBlockRe = /^((\.)(\s|$))|^((\||')(\s?))/;
  var textContentRe = /^( ?)(.*)$/;
  var tagRe = /^(?:#|\.|\*(?=[^\s]+)|(\w+(?:\w+|:|-)*\w|\w+))/;
  var attrShortcutRe = /^([\.#]+)((?:\w+|-)*)/;
  var tagShortcut = {
    ".": "div",
    "#": "div"
  };
  var attrShortcut = {
    "#": ["id"],
    ".": ["class"]
  };
  function Parser(attrDelims) {
    this._attrDelims = attrDelims || { "(": ")", "[": "]" };
    let attrDelimsStr = "";
    for (const key in this._attrDelims) {
      attrDelimsStr += key + this._attrDelims[key];
    }
    attrDelimsStr = this._escapeRegExp(attrDelimsStr);
    this._attrName = "^\\s*((?!\\${)[^\\0\"'><\\/=\\s#" + attrDelimsStr + "]+)";
    this._quotedAttrRe = new RegExp(`${this._attrName}\\s*=(=?)\\s*("|')`);
    this._codeAttrRe = new RegExp(`${this._attrName}\\s*=(=?)\\s*`);
  }
  var p13 = Parser.prototype;
  p13._escapeRegExp = (str) => {
    if (!str) {
      return "";
    }
    return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  };
  p13._reset = function(lines, stacks) {
    this._indents = [];
    this._stacks = stacks || [];
    this._lineno = 0;
    this._lines = lines;
    this._line = this._origLine = null;
    this._indents._last = this._stacks._last = function() {
      return this[this.length - 1];
    };
  };
  p13._pushOnTop = function(item) {
    this._stacks._last().push(item);
  };
  p13._sliceLine = function(beginSlice) {
    this._line = this._line.slice(beginSlice);
  };
  p13._nextLine = function() {
    if (this._lines.length) {
      this._origLine = this._lines.shift();
      this._lineno++;
      this._line = this._origLine;
    } else {
      this._origLine = this._line = null;
    }
    return this._line;
  };
  p13._getIndent = (line) => {
    const m = line.match(indentRegex);
    return m ? m[0].replace(tabRe, " ").length : 0;
  };
  p13.exec = function(str, options) {
    if (options && options.filename) {
      this._file = options.filename;
    } else {
      this._file = null;
    }
    const res = ["multi"];
    this._reset(str.split(newLineRe), [res]);
    while (this._nextLine() !== null) {
      this._parseLine();
    }
    this._reset();
    return res;
  };
  p13._parseLine = function() {
    if (emptyLineRe.test(this._line)) {
      this._pushOnTop(["newline"]);
      return;
    }
    const indent = this._getIndent(this._line);
    if (!this._indents.length) {
      this._indents.push(indent);
    }
    this._line = this._line.replace(indentationRe, "");
    const expectingIndentation = this._stacks.length > this._indents.length;
    if (indent > this._indents._last()) {
      if (!expectingIndentation) {
        this._syntaxError("Unexpected indentation");
      }
      this._indents.push(indent);
    } else {
      if (expectingIndentation) {
        this._stacks.pop();
      }
      while (indent < this._indents._last() && this._indents.length > 1) {
        this._indents.pop();
        this._stacks.pop();
      }
      if (indent !== this._indents._last()) {
        this._syntaxError("Malformed indentation");
      }
    }
    this._parseLineIndicators();
  };
  var _parseHtmlComment = (parser, m) => {
    parser._pushOnTop([
      "html",
      "comment",
      [
        "slm",
        "text",
        parser._parseTextBlock(
          parser._line.slice(m[0].length),
          parser._indents._last() + m[1].length + 2
        )
      ]
    ]);
  };
  var _parseHtmlConditionalComment = (parser, m) => {
    const block = ["multi"];
    parser._pushOnTop(["html", "condcomment", m[1], block]);
    parser._stacks.push(block);
  };
  var _parseTextBlock = (parser, m) => {
    let char, space;
    if (m[2] === void 0) {
      char = m[5];
      space = m[6];
    } else {
      char = m[2];
      space = m[3];
    }
    const trailingWS = char === "." || char === "'";
    parser._pushOnTop([
      "slm",
      "text",
      parser._parseTextBlock(
        parser._line.slice(m[0].length),
        parser._indents._last() + space.length + 1
      )
    ]);
    if (trailingWS) {
      parser._pushOnTop(["static", " "]);
    }
  };
  var _parseOutputBlock = (parser, m) => {
    parser._sliceLine(m[0].length);
    const trailingWS = m[2].includes(">");
    const block = ["multi"];
    if (m[2].includes("<")) {
      parser._pushOnTop(["static", " "]);
    }
    parser._pushOnTop([
      "slm",
      "output",
      m[1].length === 0,
      parser._parseBrokenLine(),
      block
    ]);
    if (trailingWS) {
      parser._pushOnTop(["static", " "]);
    }
    parser._stacks.push(block);
  };
  var _parseEmbeded = (parser, m) => {
    parser._pushOnTop(["slm", "embedded", m[1], parser._parseTextBlock()]);
  };
  var _parseCommentBlock = (parser) => {
    while (parser._lines.length) {
      if (!emptyLineRe.test(parser._lines[0])) {
        const indent = parser._getIndent(parser._lines[0]);
        if (indent <= parser._indents._last()) {
          break;
        }
      }
      parser._nextLine();
      parser._pushOnTop(["newline"]);
    }
  };
  var _parseInlineHtml = (parser) => {
    const block = ["multi"];
    parser._pushOnTop(["multi", ["slm", "interpolate", parser._line], block]);
    parser._stacks.push(block);
  };
  var _parseCodeBlock = (parser) => {
    parser._sliceLine(1);
    const block = ["multi"];
    parser._pushOnTop(["slm", "control", parser._parseBrokenLine(), block]);
    parser._stacks.push(block);
  };
  var _parseDoctype = (parser, m) => {
    const value = parser._line.slice(m[0].length).trim();
    parser._pushOnTop(["html", "doctype", value]);
  };
  var _parseTag = (parser, m) => {
    if (m[1]) {
      parser._sliceLine(m[0].length);
    }
    parser._parseTag(m[0]);
  };
  p13._matchLineThen = function(regex, next) {
    const m = regex.exec(this._line);
    if (m) {
      next(this, m);
      return true;
    }
    return false;
  };
  p13._ifTrueThen = function(condition, next) {
    if (condition) {
      next(this);
      return true;
    }
    return false;
  };
  p13._parseLineIndicators = function() {
    for (; ; ) {
      const firstChar = this._line[0];
      if (
        // HTML comment
        this._matchLineThen(htmlCommentRe, _parseHtmlComment) || // or HTML conditional comment
        this._matchLineThen(
          htmlConditionalCommentRe,
          _parseHtmlConditionalComment
        ) || // Slm comment
        this._ifTrueThen(firstChar === "/", _parseCommentBlock) || // Text block.
        this._matchLineThen(textBlockRe, _parseTextBlock) || // Inline html
        this._ifTrueThen(firstChar === "<", _parseInlineHtml) || // Code block.
        this._ifTrueThen(firstChar === "-", _parseCodeBlock) || // Output block.
        this._matchLineThen(outputBlockRe, _parseOutputBlock) || // Embedded template.
        this._matchLineThen(embededRe, _parseEmbeded) || // Doctype declaration
        this._matchLineThen(doctypeRe, _parseDoctype) || // HTML tag
        this._matchLineThen(tagRe, _parseTag)
      ) {
        this._pushOnTop(["newline"]);
        return;
      }
      this._syntaxError("Unknown line indicator");
    }
  };
  p13._parseShortcutAttributes = function() {
    const attributes = ["html", "attrs"];
    let m;
    while (m = attrShortcutRe.exec(this._line)) {
      const shortcut = attrShortcut[m[1]];
      if (!shortcut) {
        this._syntaxError("Illegal shortcut");
      }
      for (let i = 0, il = shortcut.length; i < il; i++) {
        attributes.push(["html", "attr", shortcut[i], ["static", m[2]]]);
      }
      this._sliceLine(m[0].length);
    }
    return attributes;
  };
  p13._parseTag = function(tag) {
    let m, trailingWS, leadingWS;
    if (tagShortcut[tag]) {
      tag = tagShortcut[tag];
    }
    const attributes = this._parseShortcutAttributes();
    m = /^[<>]+/.exec(this._line);
    if (m) {
      this._sliceLine(m[0].length);
      trailingWS = m[0].includes(">");
      leadingWS = m[0].includes("<");
    }
    this._parseAttributes(attributes);
    tag = ["html", "tag", tag, attributes];
    if (leadingWS) {
      this._pushOnTop(["static", " "]);
    }
    this._pushOnTop(tag);
    if (trailingWS) {
      this._pushOnTop(["static", " "]);
    }
    for (; ; ) {
      m = blockExpressionRe.exec(this._line);
      if (m) {
        this._sliceLine(m[0].length);
        if (!(m = tagRe.exec(this._line))) {
          this._syntaxError("Expected tag");
        }
        if (m[1]) {
          this._sliceLine(m[0].length);
        }
        const content = ["multi"];
        tag.push(content);
        const sl = this._stacks.length;
        this._stacks.push(content);
        this._parseTag(m[0]);
        this._stacks.splice(sl, 1);
        break;
      }
      m = outputCodeRe.exec(this._line);
      if (m) {
        this._sliceLine(m[0].length);
        const trailingWS2 = m[2].includes(">");
        const block = ["multi"];
        if (!leadingWS && m[2].includes("<")) {
          const lastStack = this._stacks._last();
          lastStack.splice(lastStack.length - 1, 0, ["static", " "]);
        }
        tag.push(["slm", "output", m[1] !== "=", this._parseBrokenLine(), block]);
        if (!trailingWS && trailingWS2) {
          this._pushOnTop(["static", " "]);
        }
        this._stacks.push(block);
        break;
      }
      m = closedTagRe.exec(this._line);
      if (m) {
        this._sliceLine(m[0].length);
        if (this._line.length) {
          this._syntaxError("Unexpected text after closed tag");
        }
        break;
      }
      if (emptyLineRe.test(this._line)) {
        const emptyContent = ["multi"];
        tag.push(emptyContent);
        this._stacks.push(emptyContent);
        break;
      }
      m = textContentRe.exec(this._line);
      if (m) {
        tag.push([
          "slm",
          "text",
          this._parseTextBlock(
            m[2],
            this._origLine.length - this._line.length + m[1].length,
            true
          )
        ]);
        break;
      }
      break;
    }
  };
  p13._parseAttributes = function(attributes) {
    let delimiter, m;
    m = attrDelimRe.exec(this._line);
    if (m) {
      delimiter = this._attrDelims[m[1]];
      this._sliceLine(m[0].length);
    }
    let booleanAttrRe, endRe;
    if (delimiter) {
      booleanAttrRe = new RegExp(
        `${this._attrName}(?=(\\s|${this._escapeRegExp(delimiter)}|$))`
      );
      endRe = new RegExp(`^\\s*${this._escapeRegExp(delimiter)}`);
    }
    while (true) {
      m = this._quotedAttrRe.exec(this._line);
      if (m) {
        this._sliceLine(m[0].length);
        attributes.push([
          "html",
          "attr",
          m[1],
          [
            "escape",
            !m[2].length,
            ["slm", "interpolate", this._parseQuotedAttribute(m[3])]
          ]
        ]);
        continue;
      }
      m = this._codeAttrRe.exec(this._line);
      if (m) {
        this._sliceLine(m[0].length);
        const name = m[1], escape2 = !m[2].length;
        const value = this._parseJSCode(delimiter);
        if (!value.length) {
          this._syntaxError("Invalid empty attribute");
        }
        attributes.push([
          "html",
          "attr",
          name,
          ["slm", "attrvalue", escape2, value]
        ]);
        continue;
      }
      if (!delimiter) {
        break;
      }
      m = booleanAttrRe.exec(this._line);
      if (m) {
        this._sliceLine(m[0].length);
        attributes.push(["html", "attr", m[1], ["multi"]]);
        continue;
      }
      m = endRe.exec(this._line);
      if (m) {
        this._sliceLine(m[0].length);
        break;
      }
      this._line = this._line.replace(indentationRe, "");
      if (this._line.length) {
        this._syntaxError("Expected attribute");
      }
      this._pushOnTop(["newline"]);
      if (!this._lines.length) {
        this._syntaxError(`Expected closing delimiter ${delimiter}`);
      }
      this._nextLine();
    }
  };
  p13._parseTextBlock = function(firstLine, textIndent, inTag) {
    const result = ["multi"];
    if (!firstLine || !firstLine.length) {
      textIndent = null;
    } else {
      result.push(["slm", "interpolate", firstLine]);
    }
    let emptyLines = 0;
    while (this._lines.length) {
      if (emptyLineRe.test(this._lines[0])) {
        this._nextLine();
        result.push(["newline"]);
        if (textIndent) {
          emptyLines++;
        }
      } else {
        const indent = this._getIndent(this._lines[0]);
        if (indent <= this._indents._last()) {
          break;
        }
        if (emptyLines) {
          result.push([
            "slm",
            "interpolate",
            new Array(emptyLines + 1).join("\n")
          ]);
          emptyLines = 0;
        }
        this._nextLine();
        this._line = this._line.replace(indentationRe, "");
        const offset = textIndent ? indent - textIndent : 0;
        if (offset < 0) {
          this._syntaxError(
            `Text line not indented deep enough.
The first text line defines the necessary text indentation.${inTag ? "\nAre you trying to nest a child tag in a tag containing text? Use | for the text block!" : ""}`
          );
        }
        result.push(["newline"]);
        result.push([
          "slm",
          "interpolate",
          (textIndent ? "\n" : "") + new Array(offset + 1).join(" ") + this._line
        ]);
        textIndent = textIndent || indent;
      }
    }
    return result;
  };
  p13._parseBrokenLine = function() {
    let brokenLine = this._line.trim(), m;
    while (m = nextLineRe.exec(brokenLine)) {
      this._expectNextLine();
      if (m[0] === "\\") {
        brokenLine = brokenLine.slice(0, brokenLine.length - 2);
      }
      brokenLine += `
${this._line}`;
    }
    return brokenLine;
  };
  p13._parseJSCode = function(outerDelimeter) {
    let code = "", count = 0, delimiter, closeDelimiter, m;
    const endRe = new RegExp(`^[\\s${this._escapeRegExp(outerDelimeter)}]`);
    while (this._line.length && (count || !endRe.test(this._line))) {
      m = nextLineRe.exec(this._line);
      if (m) {
        if (m[0] === "\\") {
          code += this._line.slice(0, this._line.length - 2);
        } else {
          code += this._line;
        }
        code += "\n";
        this._expectNextLine();
      } else {
        if (count > 0) {
          if (this._line[0] === delimiter[0]) {
            count++;
          } else if (this._line[0] === closeDelimiter[0]) {
            count--;
          }
        } else {
          m = delimRe.exec(this._line);
          if (m) {
            count = 1;
            delimiter = m[0];
            closeDelimiter = this._attrDelims[delimiter];
          }
        }
        code += this._line[0];
        this._sliceLine(1);
      }
    }
    if (count) {
      this._syntaxError(`Expected closing delimiter ${closeDelimiter}`);
    }
    return code;
  };
  p13._parseQuotedAttribute = function(quote) {
    let value = "", count = 0;
    while (count !== 0 || this._line[0] !== quote) {
      const m = /^(\\)?$/.exec(this._line);
      if (m) {
        value += m[1] ? " " : "\n";
        this._expectNextLine();
      } else {
        const firstChar = this._line[0];
        if (count > 0) {
          if (firstChar === "{") {
            count++;
          } else if (firstChar === "}") {
            count--;
          }
        } else if (/^\$\{/.test(this._line)) {
          value += firstChar;
          this._sliceLine(1);
          count = 1;
        }
        value += this._line[0];
        this._sliceLine(1);
      }
    }
    this._sliceLine(1);
    return value;
  };
  p13._syntaxError = function(message) {
    let column = this._origLine !== null && this._line !== null ? this._origLine.length - this._line.length : 0;
    column += 1;
    const msg = [
      message,
      `  ${this._file || "(__TEMPLATE__)"}, Line ${this._lineno}, Column ${column}`,
      `  ${this._origLine || ""}`,
      `  ${new Array(column).join(" ")}^`,
      ""
    ].join("\n");
    throw new Error(msg);
  };
  p13._expectNextLine = function() {
    if (this._nextLine() === null) {
      this._syntaxError("Unexpected end of file");
    }
    this._line = this._line.trim();
  };
  var parser_default = Parser;

  // lib/filters/static_merger.js
  function StaticMerger() {
  }
  StaticMerger.prototype = new filter_default();
  StaticMerger.prototype.on_multi = function(exps) {
    const res = ["multi"];
    let node;
    for (let i = 1, l = exps.length; i < l; i++) {
      const exp = exps[i];
      if (exp[0] === "static") {
        if (node) {
          node[1] += exp[1];
        } else {
          node = ["static", exp[1]];
          res.push(node);
        }
      } else {
        res.push(this.compile(exp));
        if (exp[0] !== "newline") {
          node = null;
        }
      }
    }
    return res.length === 2 ? res[1] : res;
  };
  var static_merger_default = StaticMerger;

  // lib/generator.js
  function Generator() {
    this._buffer = "_b";
  }
  var p14 = Generator.prototype = new dispatcher_default();
  p14.exec = function(exp) {
    return [this.preamble(), this.compile(exp)].join("");
  };
  p14.on = (exp) => {
    throw new Error(
      `Generator supports only core expressions - found ${JSON.stringify(exp)}`
    );
  };
  p14.on_multi = function(exps) {
    for (let i = 1, l = exps.length; i < l; i++) {
      exps[i] = this.compile(exps[i]);
    }
    exps.shift();
    return exps.join("\n");
  };
  p14.on_newline = () => "";
  p14.on_static = function(exps) {
    return this.concat(JSON.stringify(exps[1]));
  };
  p14.on_dynamic = function(exps) {
    return this.concat(exps[1]);
  };
  p14.on_code = (exps) => exps[1];
  p14.concat = function(str) {
    return `${this._buffer}+=${str};`;
  };
  var generator_default = Generator;

  // lib/generators/string.js
  function StringGenerator(name, initializer) {
    this._buffer = name || "_b";
    this._initializer = initializer;
  }
  var p15 = StringGenerator.prototype = new generator_default();
  p15.preamble = function() {
    return this._initializer ? this._initializer : `var ${this._buffer}='';`;
  };
  p15.on_capture = function(exps) {
    const generator = new StringGenerator(exps[1], exps[2]);
    generator._dispatcher = this._dispatcher;
    return generator.exec(exps[3]);
  };
  var string_default = StringGenerator;

  // lib/template.js
  function Template(VM2, options = {}) {
    options.mergeAttrs = options.mergeAttrs || { class: " " };
    options.attrDelims = options.attrDelims || { "(": ")", "[": "]" };
    this.VM = VM2;
    this._engine = new engine_default();
    this.Embeddeds = embedded_default;
    this._embedded = new embedded_default.Embedded();
    this.registerEmbedded("script", new embedded_default.Javascript());
    this.registerEmbedded(
      "javascript",
      new embedded_default.Javascript({ typeAttribute: true })
    );
    this.registerEmbedded("css", new embedded_default.CSS());
    const filters = this._defaultFilters(options);
    for (let i = 0, il = filters.length; i < il; i++) {
      this._engine.use(filters[i]);
    }
  }
  var p16 = Template.prototype;
  p16._defaultFilters = function(options) {
    return [
      new parser_default(options.attrDelims),
      this._embedded,
      new interpolate_default(),
      new brackets_default(),
      new controls_default(),
      new attr_merge_default(options.mergeAttrs),
      new code_attributes_default(options.mergeAttrs),
      new attr_remove_default(options.mergeAttrs),
      new fast_default(options.format),
      new escape_default(),
      new control_flow_default(),
      new multi_flattener_default(),
      new static_merger_default(),
      new string_default()
    ];
  };
  p16.registerEmbedded = function(name, engine) {
    this._embedded.register(name, engine);
  };
  p16.registerEmbeddedFunction = function(name, renderer) {
    const engine = new this.Embeddeds.InterpolateEngine(renderer);
    this.registerEmbedded(name, engine);
  };
  p16.render = function(src2, model, options = {}, vm = new this.VM()) {
    return this.compile(src2, options, vm)(model, vm);
  };
  p16.renderAsync = function(src2, model, options = {}, vm = new this.VM()) {
    return this.compileAsync(src2, options, vm)(model, vm);
  };
  p16.compile = function(src2, options = {}, vm = new this.VM()) {
    const syncOptions = Object.assign({}, options, { useAsync: false });
    const fn = this.exec(src2, syncOptions, vm);
    const fnWrap = (model) => {
      const res = fn.call(model, vm);
      vm.reset();
      return res;
    };
    return fnWrap;
  };
  p16.compileAsync = function(src2, options = {}, vm = new this.VM()) {
    const asyncOptions = Object.assign({}, options, { useAsync: true });
    const fn = this.exec(src2, asyncOptions, vm);
    return (model) => __async(this, null, function* () {
      const res = yield fn.call(model, vm);
      vm.reset();
      return res;
    });
  };
  p16.exec = function(src2, options = {}, vm) {
    if (options.useCache !== void 0 && !options.useCache) {
      vm._load = vm._loadWithoutCache;
    }
    vm.template = this;
    vm.basePath = options.basePath;
    vm.filename = options.filename;
    vm.require = options.require || customRequire;
    vm.rebind();
    return vm.runInContext(this.src(src2, options), vm.filename)[0];
  };
  p16.src = function(src2, options = {}) {
    if (options.useAsync) {
      return [
        "[async function(vm) {",
        "vm.m = this;",
        "var sp = vm.stack.length, require = vm.require, content = vm._content, extend = vm._extend, partial = vm._partial, mixin = vm._mixin, j = vm.j;",
        this._engine.exec(src2, options),
        "vm.res=_b;return await vm.pop(sp);}]"
      ].join("");
    }
    return [
      "[function(vm) {",
      "vm.m = this;",
      "var sp = vm.stack.length, require = vm.require, content = vm._content, extend = vm._extend, partial = vm._partial, mixin = vm._mixin, j = vm.j;",
      this._engine.exec(src2, options),
      "vm.res=_b;return vm.pop(sp);}]"
    ].join("");
  };
  p16.exports = function() {
    return {
      Template,
      template: this,
      compile: this.compile.bind(this),
      compileAsync: this.compileAsync.bind(this),
      render: this.render.bind(this),
      renderAsync: this.renderAsync.bind(this)
    };
  };
  var template_default = Template;

  // lib/vm_browser.js
  function VMBrowser() {
    vm_default.call(this);
  }
  var p17 = VMBrowser.prototype = new vm_default();
  p17.runInContext = (src, filename) => {
    if (filename) {
      src += `
//# sourceURL=${filename}`;
    }
    return eval(src);
  };
  p17._resolvePath = () => {
  };
  var vm_browser_default = VMBrowser;

  // lib/slm_browser.js
  var template = new template_default(VMBrowser);
  var exported = template.exports();
  var { render, renderAsync, compile, compileAsync } = exported;
  var slm_browser_default = exported;
  return __toCommonJS(slm_browser_exports);
})();
