import slm from './lib/slm.js';

const compile = slm.compile;
const template = compile('p Hello, ${this.name}!');
console.log(template({ name: 'Deno' }));
