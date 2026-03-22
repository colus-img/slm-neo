import VM from '../lib/vm.js';

export const assertHtml = (template, src, result, options) => {

  if (Array.isArray(src)) {
    src = src.join('\n');
  }

  const env = {};
  const context = {
    items: [1,2,3],
    idHelper: 'notice',
    outputNumber: 1337,
    helloWorld: 'Hello World from @env',
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
      return [m1, m2].join(' ');
    },
    helloBlock(callback) {
      return `${this.helloWorld} ${callback()} ${this.helloWorld}`;
    },
    block(callback) {
      return VM.safe(callback());
    },
    content() {
      switch (arguments.length) {
        case 0:
          return env[''];
        case 1:
          return env[arguments[0]];
        case 2:
          const arg = arguments[0];
          if (!arg) {
            return arguments[1]();
          }
          return env[arg] || arguments[1]();
      }
    },
    evilMethod() {
      return '<script>do_something_evil();</script>';
    }
  };
  expect(template.render(src, context, options)).toEqual(result);
};

export const assertSyntaxError = (template, src, result, options) => {
  src = src.join('\n');
  const context = {
    idHelper: 'notice',
    outputNumber: 1337,
    helloWorld: 'Hello World from @env',
    showFirst(force) {
      if (force !== undefined) {
        return force;
      }
      return false;
    },
    x: 0,
    message(v) { return v; },
    helloBlock(callback) {
      return `${this.helloWorld} ${callback()} ${this.helloWorld}`;
    }
  };
  expect(() => {
    template.render(src, context, options);
  }).toThrow(result);
};
