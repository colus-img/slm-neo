const methodSplitRE = /_/;
const methodRE = /^on(_\w+)*$/;

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
    code += `\ncase '${key}' : \n`;
    code +=  `${this._nodes[key].compile(level + 1, callMethod)};`;
  }

  if (empty) {
    return `return ${callMethod}`;
  }

  code += `\ndefault:\nreturn ${callMethod || 'exps'};}`;

  return code;
};

function Dispatcher() { }

const DispatcherProto = Dispatcher.prototype;

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
    for (let j = 1, jl = types.length; j < jl; j++) {
      const type = types[j];
      const n = node._nodes[type];
      node = node._nodes[type] = n || new Node();
    }
    node._method = method;
  }
  this._dispatcher = new Function('exps', tree.compile(0));
  return this._dispatcher(exp);
};

export default Dispatcher;
