import VMNode from '../../lib/vm_node.js';
import Template from '../../lib/template.js';
import { assertHtml } from '../helper.js';

describe('Html structure', () => {

  let template;

  beforeEach(() => {
    template = new Template(VMNode);
  });

  test('simple render', () => {
    assertHtml(template, [
      'html',
      '  head',
      '    title Simple Test Title',
      '  body ',
      '    p Hello World, meet Slim.'
    ],
    '<html><head><title>Simple Test Title</title></head><body><p>Hello World, meet Slim.</p></body></html>',
    {});
  });

  test('relaxed indentation of first line', () => {
    assertHtml(template, [
      '  p',
      '    .content'
    ],
    '<p><div class=\"content\"></div></p>',
    {});
  });

  test('html tag with text and empty line', () => {
    assertHtml(template, [
      'p Hello',
      '',
      'p World'
    ],
    '<p>Hello</p><p>World</p>',
    {});
  });

  test('html namespaces', () => {
    assertHtml(template, [
      'html:body',
      '  html:p html:id="test" Text'
    ],
    '<html:body><html:p html:id="test">Text</html:p></html:body>',
    {});
  });

  test('doctype', () => {
    assertHtml(template, [
      'doctype 1.1',
      'html'
    ],
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html></html>',
    {});
  });

  test('render with shortcut attributes', () => {
    assertHtml(template, [
      'h1#title This is my title',
      '#notice.hello.world',
      '  = this.helloWorld'
    ],
    '<h1 id="title">This is my title</h1><div class="hello world" id="notice">Hello World from @env</div>',
    {});
  });

  test('render with text block', () => {
    assertHtml(template, [
      'p',
      '  |',
      '   Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    ],
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
    {});
  });

  test('render with text block with subsequent markup', () => {
    assertHtml(template, [
      'p',
      '  |',
      '    Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'p Some more markup'
    ],
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Some more markup</p>',
    {});
  });

  test('render with text block with subsequent markup', () => {
    assertHtml(template, [
      'p',
      '  |',
      '    Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'p Some more markup'
    ],
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Some more markup</p>',
    {});
  });

  test('render with text block with trailing whitespace', () => {
    assertHtml(template, [
      '. this is',
      '  a link to',
      'a href="link" page'
    ],
    'this is\na link to <a href="link">page</a>',
    {});
  });

  test('render with text block with trailing whitespace', () => {
    assertHtml(template, [
      'p',
      ' |',
      '  This is line one.',
      '   This is line two.',
      '    This is line three.',
      '     This is line four.',
      'p This is a new paragraph.'
    ],
    '<p>This is line one.\n This is line two.\n  This is line three.\n   This is line four.</p><p>This is a new paragraph.</p>',
    {});
  });

  test('nested text with nested html one same line', () => {
    assertHtml(template, [
      'p',
      ' | This is line one.',
      '    This is line two.',
      ' span.bold This is a bold line in the paragraph.',
      ' |  This is more content.'
    ],
    '<p>This is line one.\n This is line two.<span class="bold">This is a bold line in the paragraph.</span> This is more content.</p>',
    {});
  });

  test('nested text with nested html one same line 2', () => {
    assertHtml(template, [
      'p',
      ' |This is line one.',
      '   This is line two.',
      ' span.bold This is a bold line in the paragraph.',
      ' |  This is more content.'
    ],
    '<p>This is line one.\n This is line two.<span class="bold">This is a bold line in the paragraph.</span> This is more content.</p>',
    {});
  });

  test('nested text with nested html', () => {
    assertHtml(template, [
      'p',
      ' |',
      '  This is line one.',
      '   This is line two.',
      '    This is line three.',
      '     This is line four.',
      ' span.bold This is a bold line in the paragraph.',
      ' |  This is more content.'
    ],
    '<p>This is line one.\n This is line two.\n  This is line three.\n   This is line four.<span class="bold">This is a bold line in the paragraph.</span> This is more content.</p>',
    {});
  });

  test('simple paragraph with padding', () => {
    assertHtml(template, [
      'p    There will be 3 spaces in front of this line.'
    ],
    '<p>   There will be 3 spaces in front of this line.</p>',
    {});
  });

  test('paragraph with nested text', () => {
    assertHtml(template, [
      'p This is line one.',
      '   This is line two.'
    ],
    '<p>This is line one.\n This is line two.</p>',
    {});
  });

  test('paragraph with padded nested text', () => {
    assertHtml(template, [
      'p  This is line one.',
      '   This is line two.'
    ],
    '<p> This is line one.\n This is line two.</p>',
    {});
  });

  test('labels with with br', () => {
    assertHtml(template, [
      'label',
      '  . Название',
      '  input name="name" type="text" value=1',
      'br',
      '',
      'label',
      '  . Название 2',
      '  input name="name" type="text" value=2'
    ],
    '<label>Название <input name="name" type="text" value="1" /></label><br /><label>Название 2 <input name="name" type="text" value="2" /></label>',
    {});
  });

  test('with inline mustashe', () => {
    assertHtml(template, [
      'label {{title}}'
    ],
    '<label>{{title}}</label>',
    {});
  });

  test('paragraph with attributes and nested text', () => {
    assertHtml(template, [
      'p#test class="paragraph" This is line one.',
      '                         This is line two.'
    ],
    '<p class="paragraph" id="test">This is line one.\nThis is line two.</p>',
    {});
  });

  test('output code with leading spaces', () => {
    assertHtml(template, [
      'p= this.helloWorld',
      'p = this.helloWorld',
      'p    = this.helloWorld'
    ],
    '<p>Hello World from @env</p><p>Hello World from @env</p><p>Hello World from @env</p>',
    {});
  });

  test('output code with leading spaces 2', () => {
    assertHtml(template, [
      'p =< this.helloWorld'
    ],
    ' <p>Hello World from @env</p>',
    {});

    assertHtml(template, [
      'p<= this.helloWorld'
    ],
    ' <p>Hello World from @env</p>',
    {});
  });

  test('single quoted attributes', () => {
    assertHtml(template, [
      'p class=\'underscored_class_name\' = this.outputNumber'
    ],
    '<p class="underscored_class_name">1337</p>',
    {});
  });

  test('nonstandard shortcut attributes', () => {
    assertHtml(template, [
      'p#dashed-id.underscored_class_name = this.outputNumber'
    ],
    '<p class="underscored_class_name" id="dashed-id">1337</p>',
    {});
  });

  test('dashed attributes', () => {
    assertHtml(template, [
      'p data-info="Illudium Q-36" = this.outputNumber'
    ],
    '<p data-info="Illudium Q-36">1337</p>',
    {});
  });

  test('dashed attributes with shortcuts', () => {
    assertHtml(template, [
      'p#marvin.martian data-info="Illudium Q-36" = this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  test('parens around attributes', () => {
    assertHtml(template, [
      'p(id="marvin" class="martian" data-info="Illudium Q-36") = this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  test('square brackets around attributes', () => {
    assertHtml(template, [
      'p[id="marvin" class="martian" data-info="Illudium Q-36"] = this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  test('parens around attributes with equal sign snug to right paren', () => {
    assertHtml(template, [
      'p(id="marvin" class="martian" data-info="Illudium Q-36")= this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  test('closed tag', () => {
    assertHtml(template, [
      'closed/'
    ],
    '<closed />',
    {});
  });

  test('attributes with parens and spaces', () => {
    assertHtml(template, [
      'label[ for=\'filter\' ]= this.helloWorld'
    ],
    '<label for="filter">Hello World from @env</label>',
    {});
  });

  test('attributes with parens and spaces 2', () => {
    assertHtml(template, [
      'label[ for=\'filter\' ] = this.helloWorld'
    ],
    '<label for="filter">Hello World from @env</label>',
    {});
  });

  test('attributes with multiple spaces', () => {
    assertHtml(template, [
      'label  for=\'filter\'  class="test" = this.helloWorld'
    ],
    '<label class="test" for="filter">Hello World from @env</label>',
    {});
  });

  test('closed tag with attributes', () => {
    assertHtml(template, [
      'closed id="test" /'
    ],
    '<closed id="test" />',
    {});
  });

  test('closed tag with attributes and parens', () => {
    assertHtml(template, [
      'closed(id="test")/'
    ],
    '<closed id="test" />',
    {});
  });

  test('render with html comments', () => {
    assertHtml(template, [
      'p Hello',
      '/! This is a comment',
      '',
      '   Another comment',
      'p World'
    ],
    '<p>Hello</p><!--This is a comment\n\nAnother comment--><p>World</p>',
    {});
  });

  test('render with html conditional and tag', () => {
    assertHtml(template, [
      '/[ if IE ]',
      ' p Get a better browser.'
    ],
    '<!--[if IE]><p>Get a better browser.</p><![endif]-->',
    {});
  });

  test('render with html conditional and method output', () => {
    assertHtml(template, [
      '/[ if IE ]',
      ' = this.message(\'hello\')'
    ],
    '<!--[if IE]>hello<![endif]-->',
    {});
  });

  test('multiline attributes with method', () => {
    assertHtml(template, [
      'p(id="marvin"',
      'class="martian"',
      ' data-info="Illudium Q-36") = this.outputNumber'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">1337</p>',
    {});
  });

  test('multiline attributes with text on same line', () => {
    assertHtml(template, [
      'p[id="marvin"',
      '  class="martian"',
      ' data-info="Illudium Q-36"] THE space modulator'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">THE space modulator</p>',
    {});
  });

  test('multiline attributes with nested text', () => {
    assertHtml(template, [
      'p(id="marvin"',
      '  class="martian"',
      'data-info="Illudium Q-36")',
      '  | THE space modulator'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="marvin">THE space modulator</p>',
    {});
  });

  test('multiline attributes with dynamic attr', () => {
    assertHtml(template, [
      'p[id=this.idHelper',
      '  class="martian"',
      '  data-info="Illudium Q-36"]',
      '  | THE space modulator'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="notice">THE space modulator</p>',
    {});
  });

  test('multiline attributes with nested tag', () => {
    assertHtml(template, [
      'p(id=this.idHelper',
      '  class="martian"',
      '  data-info="Illudium Q-36")',
      '  span.emphasis THE',
      '  |  space modulator'
    ],
    '<p class="martian" data-info="Illudium Q-36" id="notice"><span class="emphasis">THE</span> space modulator</p>',
    {});
  });

  test('multiline attributes with nested text and extra indentation', () => {
    assertHtml(template, [
      'li( id="myid"',
      '    class="myclass"',
      'data-info="myinfo")',
      '  a href="link" My Link'
    ],
    '<li class="myclass" data-info="myinfo" id="myid"><a href="link">My Link</a></li>',
    {});
  });

  test('block expansion support', () => {
    assertHtml(template, [
      'ul',
      '  li.first: a href=\'a\' foo',
      '  li:       a href=\'b\' bar',
      '  li.last:  a href=\'c\' baz'
    ],
    '<ul><li class=\"first\"><a href=\"a\">foo</a></li><li><a href=\"b\">bar</a></li><li class=\"last\"><a href=\"c\">baz</a></li></ul>',
    {});
  });

  test('block expansion class attributes', () => {
    assertHtml(template, [
      '.a: .b: #c d'
    ],
    '<div class="a"><div class="b"><div id="c">d</div></div></div>',
    {});
  });

  test('block expansion nesting', () => {
    assertHtml(template, [
      'html: body: .content',
      '  | Text'
    ],
    '<html><body><div class=\"content\">Text</div></body></html>',
    {});
  });

  test('eval attributes once', () => {
    assertHtml(template, [
      'input[value=++this.x]',
      'input[value=++this.x]'
    ],
    '<input value="1" /><input value="2" />',
    {});
  });

  test('html line indicator', () => {
    assertHtml(template, [
      '<html>',
      '  head',
      '    meta name="keywords" content=this.helloWorld',
      '  - if true',
      '    <p>${this.helloWorld}</p>',
      '      span = this.helloWorld',
      '</html>'
    ],
    '<html><head><meta content="Hello World from @env" name="keywords" /></head><p>Hello World from @env</p><span>Hello World from @env</span></html>',
    {});
  });

  test('html line indicator issue #4', () => {
    assertHtml(template, [
      '<script>',
      '  | var a=b;',
      '</script>'
    ],
    '<script>var a=b;</script>',
    {});
  });

  test('leading whitespace indicator on tag', () => {
    assertHtml(template, [
      'p< text'
    ],
    ' <p>text</p>',
    {});
  });

  test('trailing whitespace indicator on tag', () => {
    assertHtml(template, [
      'p> text'
    ],
    '<p>text</p> ',
    {});
  });

  test('trailing whitespace with code', () => {
    assertHtml(template, [
      'p => "text"'
    ],
    '<p>text</p> ',
    {});
    assertHtml(template, [
      'p> = "text"'
    ],
    '<p>text</p> ',
    {});
  });

  test('test context', () => {
    const VM = template.VM;
    const vm = new VM();
    vm.resetCache();

    const compileOptions = {
      basePath: '/',
      filename: '/layout.slm'
    };

    vm.cache(compileOptions.filename, template.exec([
      'html',
      '  head',
      '    = content("head")',
      '  body',
      '    = content()'
    ].join('\n'), compileOptions, vm));

    compileOptions.filename = '/partialLayout.slm';
    vm.cache(compileOptions.filename, template.exec([
      'p Partial Layout',
      '= content()'
    ].join('\n'), compileOptions, vm));

    compileOptions.filename = '/partialWorld.slm';
    vm.cache(compileOptions.filename, template.exec([
      '- extend("partialLayout")',
      '- if this.what',
      '  strong The partial is ${this.what}',
      '= content("partial.override")',
      '= content()'
    ].join('\n'), compileOptions, vm));


    compileOptions.filename = '/script';

    const src = [
      '- extend("layout")',
      '= content("head")',
      '  meta name="keywords" content=this.who',
      'p Hello, ${this.who}',
      '= partial("partial" + this.who, {what: this.what})',
      '  = content("partial.override")',
      '    p nice',
      '  strong super!!! ${this.who}'
    ].join('\n');


    const result = template.render(src, {who: 'World', what: 'the best'}, compileOptions, vm);
    expect(result).toEqual('<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p><p>Partial Layout</p><strong>The partial is the best</strong><p>nice</p><strong>super!!! World</strong></body></html>');
  });

  test('test current context in partials by default', () => {
    const VM = template.VM;
    const vm = new VM();
    vm.resetCache();

    const compileOptions = {
      basePath: '/',
      filename: '/a.slm'
    };

    vm.cache(compileOptions.filename, template.exec([
      'p Partial ${this.who}',
    ].join('\n'), compileOptions, vm));


    const src = [
      'p Current ${this.who}',
      '= partial("a")',
      '- this.who = "Another"',
      'p Current ${this.who}',
      '= partial("a")',
    ].join('\n');

    const result = template.render(src, {who: 'World', what: 'the best'}, compileOptions, vm);
    expect(result).toEqual('<p>Current World</p><p>Partial World</p><p>Current Another</p><p>Partial Another</p>');
  });
});
