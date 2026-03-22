import VMNode from '../../lib/vm_node.js';
import Template from '../../lib/template.js';
import { assertHtml } from '../helper.js';

describe('Embedded engines', () => {
  let template;

  beforeEach(() => {
    template = new Template(VMNode);
    template.registerEmbeddedFunction('customEngine', body => `<pre>${body}</pre>`);
  });

  test('render with javascript', () => {
    assertHtml(template, [
      'javascript:   ',
      '  $(function() {});',
      '',
      '',
      '  alert(\'hello\')',
      'p Hi'
      ],
      '<script type="text/javascript">$(function() {});\n\n\nalert(\'hello\')</script><p>Hi</p>',
      {});
  });

  test('render with script', () => {
    assertHtml(template, [
      'script:   ',
      '  $(function() {});',
      '',
      '',
      '  alert(\'hello\')',
      'p Hi'
      ],
      '<script>$(function() {});\n\n\nalert(\'hello\')</script><p>Hi</p>',
      {});
  });

  test('render with javascript including variable', () => {
    assertHtml(template, [
      '- var func = "alert(\'hello\');"',
      'javascript:   ',
      '  $(function() { ${func} });'
      ],
      '<script type="text/javascript">$(function() { alert(\'hello\'); });</script>',
      {});
  });

  test('render with css', () => {
    assertHtml(template, [
      'css:',
      '  body { color: red; }'
      ],
      '<style type="text/css">body { color: red; }</style>',
      {});
  });

  test('render with custom engine', () => {
    assertHtml(template, [
      'customEngine:',
      '  text ${this.helloWorld}',
      '  text ${this.helloWorld}!'
      ],
      '<pre>text Hello World from @env\ntext Hello World from @env!</pre>',
      {});
  });

  test('throws an error on unregistered engine', () => {
    expect(() => {
      assertHtml(template, [
        'unregistered:',
        '  text'
        ],
        '', {});
    }).toThrow('Embedded engine unregistered is not registered.');
  });
});
