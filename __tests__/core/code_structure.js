import VMNode from '../../lib/vm_node.js';
import Template from '../../lib/template.js';
import { assertHtml } from '../helper.js';

describe('Code structure', () => {
  let template;

  beforeEach(() => { template = new Template(VMNode); });

  test('render with conditional', () => {
    assertHtml(template, [
      'div',
      '  - if this.showFirst()',
      '      p The first paragraph',
      '  - else',
      '      p The second paragraph'
      ],
      '<div><p>The second paragraph</p></div>',
      {});
  });

  test('render with conditional else if', () => {
    assertHtml(template, [
      'div',
      '  - if this.showFirst()',
      '      p The first paragraph',
      '  - else if this.showFirst(true)',
      '      p The second paragraph',
      '  - else',
      '      p The third paragraph'
      ],
      '<div><p>The second paragraph</p></div>',
      {});
  });

  test('render with consecutive conditionals', () => {
    assertHtml(template, [
      'div',
      '  - if this.showFirst(true)',
      '      p The first paragraph',
      '  - if this.showFirst(true)',
      '      p The second paragraph'
      ],
      '<div><p>The first paragraph</p><p>The second paragraph</p></div>',
      {});
  });

  test('render with when string in condition', () => {
    assertHtml(template, [
      '- if true',
      '  | Hello',

      '- if "when" !== null',
      '  |  world'
      ],
      'Hello world',
      {});
  });

  test('render with conditional and following nonconditonal', () => {
    assertHtml(template, [
      'div',
      '  - if true',
      '      p The first paragraph',
      '  - var x = 42',
      '  = x'
      ],
      '<div><p>The first paragraph</p>42</div>',
      {});
  });

  test('render with case', () => {
    assertHtml(template, [
      '- var url = require("url");',
      'p',
      '  - switch(42)',
      '    - case 41:',
      '      | 41',
      '      - break',
      '    - case 42:',
      '      | 42',
      '      - break',
      '  |  is the answer',
      'p',
      '  - switch(41)',
      '    - case 41:',
      '      | 41',
      '      - break',
      '    - case 42:',
      '      | 42',
      '      - break',
      '  |  is the answer',
      'p',
      '  - switch(42)',
      '    - case 41:',
      '      | 41',
      '      - break',
      '    - case 42:',
      '      | 42',
      '      - break',
      '  |  is the answer',
      'p',
      '  - switch(41)',
      '    - case 41:',
      '      | 41',
      '      - break',
      '    - case 42:',
      '      | 42',
      '      - break',
      '  |  is the answer'
      ],
      '<p>42 is the answer</p><p>41 is the answer</p><p>42 is the answer</p><p>41 is the answer</p>',
      {});
  });

  test('render with slm comments', () => {
    assertHtml(template, [
      'p Hello',
      '/ This is a comment',
      '  Another comment',
      'p World'
      ],
      '<p>Hello</p><p>World</p>',
      {});
  });

  test('render with slm comments and empty line', () => {
    assertHtml(template, [
      'p Hello',
      '/ This is a comment',
      '',
      '  Another comment',
      'p World'
      ],
      '<p>Hello</p><p>World</p>',
      {});
  });

  test('render with try catch', () => {
    assertHtml(template, [
      '- try',
      '  p Try',
      '- catch error',
      '  p Catch',
      'p After'
      ],
      '<p>Try</p><p>After</p>',
      {});
  });

  test('render with try catch exception', () => {
    assertHtml(template, [
      '- try',
      '  p Try',
      '  - throw "Boom"',
      '  p After Boom',
      '- catch ex',
      '  p = ex',
      'p After'
      ],
      '<p>Try</p><p>Boom</p><p>After</p>',
      {});
  });

  test('render with try catch finally', () => {
    assertHtml(template, [
      '- try',
      '  p Try',
      '  - throw "Boom"',
      '  p After Boom',
      '- catch ex',
      '  p = ex',
      '- finally',
      '  p Finally',
      'p After'
      ],
      '<p>Try</p><p>Boom</p><p>Finally</p><p>After</p>',
      {});
  });

  test('injects callback arg', () => {
    assertHtml(template, [
      '= this.block()',
      '  p Block',
      'p After'
      ],
      '<p>Block</p><p>After</p>',
      {});
  });

  test('detects missing brace', () => {
    const src = [
      '= this.block)',
      '  p Block',
      'p After'
      ].join('\n');
    expect(() => {
      template.render(src, {}, {});
    }).toThrow('Missing open brace \"(\" in `this.block)`');
  });

  test('content', () => {
    assertHtml(template, [
      '= content()',
      'p After 1',
      '= content("head")',
      'p After 2',
      '= content(false)',
        'title title1',
      'p After 3',
      '= content("head")',
        'title title2',
      'p After 4',
      '= content("head")',
      '= content(false)',
      '  p Not captured'
      ],
      '<p>After 1</p><p>After 2</p><title>title1</title><p>After 3</p><title>title2</title><p>After 4</p><p>Not captured</p>',
      {});
  });

  test('simple mixin', () => {
    assertHtml(template, [
      '= mixin("say", "a", "b")',
      '  p Hello ${this.a} by ${this.b}',
      '.hello',
      '  = mixin("say", "Slm", "mixin")'
      ],
      '<div class="hello"><p>Hello Slm by mixin</p></div>',
      {});
  });

  test('mixin with loop', () => {
    assertHtml(template, [
      '= mixin("say", "list")',
      '  ul',
      '    - this.list.forEach(function(item))',
      '      li = item.name',
      '.hello',
      '  = mixin("say", [{ name: "a" }, { name: "b" }])'
      ],
      '<div class="hello"><ul><li>a</li><li>b</li></ul></div>',
      {});
  });

  test('mixin with content', () => {
    assertHtml(template, [
      '= content("myContent")',
      '  p Hello from mixin!',
      '= mixin("say", "listOfItems")',
      '  = content("myContent")',
      '  ul',
      '    - this.listOfItems.forEach(function(item))',
      '      li = item.name',
      '.hello',
      '  = mixin("say", [{ name: "a" }, { name: "b" }])',
      '  p ${this.items}'
      ],
      '<div class="hello"><p>Hello from mixin!</p><ul><li>a</li><li>b</li></ul><p>1,2,3</p></div>',
      {});
  });

  test('mixin with all defaults values', () => {
    assertHtml(template, [
      '= mixin("say", "a = Slm", "b = mixin")',
      '  p Hello ${this.a} by ${this.b}',
      '.hello',
      '  = mixin("say")'
      ],
      '<div class="hello"><p>Hello Slm by mixin</p></div>',
      {});
  });


  test('mixin with first default value', () => {
    assertHtml(template, [
      '= mixin("say", "a = Slm", "b")',
      '  p Hello ${this.a} by ${this.b}',
      '.hello',
      '  = mixin("say", "Mom")'
      ],
      '<div class="hello"></div>',
      {});
  });

  test('mixin with second default value', () => {
    assertHtml(template, [
      '= mixin("say", "a", "b= mixin")',
      '  p Hello ${this.a} by ${this.b}',
      '.hello',
      '  = mixin("say", "Mom")'
      ],
      '<div class="hello"><p>Hello Mom by mixin</p></div>',
      {});
  });

  test('mixin with contexts', () => {
    const VM = template.VM;
    const vm = new VM();
    vm.resetCache();

    const compileOptions = {
      basePath: '/',
      filename: 'mixins.slm'
    };

    vm.cache(compileOptions.filename, template.exec([
      '= mixin("say", "a", "b")',
      '  p Hello ${this.a} by ${this.b}'
    ].join('\n'), compileOptions, vm));

    const src = [
      '= partial("mixins.slm")',
      '.hello',
      '  = mixin("say", "Slm", "mixin")'
    ].join('\n');

    const result = template.render(src, {}, compileOptions, vm);
    expect(result).toEqual('<div class="hello"><p>Hello Slm by mixin</p></div>');
  });

  test('render with forEach', () => {
    assertHtml(template, [
      'div',
      '  - this.items.forEach(function(i))',
      '    p = i',
      ],
      '<div><p>1</p><p>2</p><p>3</p></div>',
      {});
  });

  test('render with for', () => {
    assertHtml(template, [
      'ul',
      '  - for var item in this.items',
      '    li = item'
    ],
    '<ul><li>0</li><li>1</li><li>2</li></ul>',
    {});
  });

  test('render with multiline attributes', () => {
    assertHtml(template, [
      'div class="test\\',
      '    nice"'
      ],
      '<div class="test nice"></div>',
      {});

    assertHtml(template, [
      'div class=[1,',
      '  2].join("")'
      ],
      '<div class="12"></div>',
      {});
  });

  test('render with multiline attributes', () => {
    assertHtml(template, [
      'div class=(1 + \\',
      '  2)'
      ],
      '<div class="3"></div>',
      {});

    assertHtml(template, [
      'div class=[1,',
      '  2].join("")'
      ],
      '<div class="12"></div>',
      {});
  });
});
