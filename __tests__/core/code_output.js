import VMNode from '../../lib/vm_node.js';
import Template from '../../lib/template.js';
import { assertHtml } from '../helper.js';

describe('Code output', () => {
  let template;
  beforeEach(() => {
    template = new Template(VMNode);
  });

  test('render with call', () => {
    assertHtml(template, [
      'p',
      '  = this.helloWorld'
      ],
      '<p>Hello World from @env</p>',
      {});
  });

  test('render with trailing whitespace', () => {
    assertHtml(template, [
      'p',
      '  => this.helloWorld'
      ],
      '<p>Hello World from @env </p>',
      {});
  });

  test('render with leading whitespace', () => {
    assertHtml(template, [
      'p',
      '  =< this.helloWorld'
      ],
      '<p> Hello World from @env</p>',
      {});
  });

  test('render with trailing whitespace after tag', () => {
    assertHtml(template, [
      'p=> this.helloWorld'
      ],
      '<p>Hello World from @env</p> ',
      {});
  });

  test('no escape render with trailing whitespace', () => {
    assertHtml(template, [
      'p',
      '  ==> this.helloWorld'
      ],
      '<p>Hello World from @env </p>',
      {});
  });

  test('no escape render with trailing whitespace after tag', () => {
    assertHtml(template, [
      'p==> this.helloWorld'
      ],
      '<p>Hello World from @env</p> ',
      {});
  });

  test('no escape render with trailing whitespace after tag', () => {
    assertHtml(template, [
      'p==> this.helloWorld'
      ],
      '<p>Hello World from @env</p> ',
      {});
  });

  test('render with backslash end', () => {
    assertHtml(template, [
      'p = \\',
      '"Hello" + \\',
      '" JS!"',
      '- var variable = 1 + \\',
      '      2 + \\',
      ' 3',
      '= variable + \\',
      '  1'
      ],
      '<p>Hello JS!</p>7',
      {});
  });

  test('render multi line code', () => {
    assertHtml(template, [
      '-  var niceX = function(x) {',
      '-     return x + \'nice\';',
      '-  }',
      'p = niceX("Very ")'
      ],
      '<p>Very nice</p>',
      {});
  });

  test('render with comma end', () => {
    assertHtml(template, [
      'p = this.message("Hello",',
      '                 "JS!")'
      ],
      '<p>Hello JS!</p>',
      {});
  });

});
