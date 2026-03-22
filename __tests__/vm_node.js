import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'node:module';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const customRequire = createRequire(import.meta.url);
import VMNode from '../lib/vm_node.js';
import Template from '../lib/template.js';
import FS from 'fs';
import slm from '../lib/slm.js';
const { compile } = slm;

describe('VMNode', () => {
  let fixture = {};

  beforeEach(() => {
    fixture = {};
    fixture.template = new Template(VMNode);
    fixture.VM = fixture.template.VM;
    fixture.vm = new fixture.VM();
    fixture.vm.resetCache();
  });

  test('extend with same path', () => {
    const options = {
      basePath: '/',
    };

    options.filename = '/layout.slm';
    fixture.vm.cache(
      options.filename,
      fixture.template.exec(
        [
          'html',
          '  head',
          '    = content("head")',
          '  body',
          '    = content()',
        ].join('\n'),
        options,
        fixture.vm,
      ),
    );

    options.filename = '/view.slm';
    const src = [
      '- extend("layout")',
      '= content("head")',
      '  meta name="keywords" content=this.who',
      'p Hello, ${this.who}',
    ].join('\n');

    const result = fixture.template.render(
      src,
      { who: 'World', what: 'the best' },
      options,
      fixture.vm,
    );
    expect(result).toEqual(
      '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>',
    );
  });

  test('extend with abs path', () => {
    const options = {
      basePath: '/views',
    };

    options.filename = '/views/layout.slm';
    fixture.vm.cache(
      '/views/layout.slm',
      fixture.template.exec(
        [
          'html',
          '  head',
          '    = content("head")',
          '  body',
          '    = content()',
        ].join('\n'),
        options,
        fixture.vm,
      ),
    );

    options.filename = '/views/view';
    const src = [
      '- extend("/layout")',
      '= content("head");',
      '  meta name="keywords" content=this.who',
      'p Hello, ${this.who}',
    ].join('\n');

    const result = fixture.template.render(
      src,
      { who: 'World', what: 'the best' },
      options,
      fixture.vm,
    );
    expect(result).toEqual(
      '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>',
    );
  });

  test('extend with same nested path', () => {
    const options = {
      basePath: '/',
    };

    options.filename = '/views/layout.slm';
    fixture.vm.cache(
      options.filename,
      fixture.template.exec(
        [
          'html',
          '  head',
          '    = content("head")',
          '  body',
          '    = content()',
        ].join('\n'),
        {},
        fixture.vm,
      ),
    );

    options.filename = '/views/view.slm';

    const src = [
      '- extend("layout")',
      '= content("head");',
      '  meta name="keywords" content=this.who',
      'p Hello, ${this.who}',
    ].join('\n');

    const result = fixture.template.render(
      src,
      { who: 'World', what: 'the best' },
      options,
      fixture.vm,
    );
    expect(result).toEqual(
      '<html><head><meta content="World" name="keywords" /></head><body><p>Hello, World</p></body></html>',
    );
  });

  test('extend with same nested path 2', () => {
    const options = {
      basePath: '/views',
    };
    options.filename = '/views/layouts/app.slm';
    fixture.vm.cache(
      options.filename,
      fixture.template.exec(
        [
          'html',
          '  head',
          '    = content("head")',
          '  body',
          '    = content()',
        ].join('\n'),
        options,
        fixture.vm,
      ),
    );

    options.filename = '/views/products/form.slm';
    fixture.vm.cache(
      options.filename,
      fixture.template.exec(
        ['form', '  input type="submit"'].join('\n'),
        options,
        fixture.vm,
      ),
    );

    options.filename = '/views/products/new.slm';

    const src = [
      '- extend("../layouts/app")',
      '= content("head");',
      '  meta name="keywords" content=this.who',
      '= partial("form", this)',
    ].join('\n');

    const result = fixture.template.render(
      src,
      { who: 'World', what: 'the best' },
      options,
      fixture.vm,
    );
    expect(result).toEqual(
      '<html><head><meta content="World" name="keywords" /></head><body><form><input type="submit" /></form></body></html>',
    );
  });

  test('test require', () => {
    const options = {
      basePath: '/views',
      require: customRequire,
    };

    options.filename = '/views/forms/form.slm';
    const src = ['- var p = require("path");', 'p = p.extname("super.slm")'].join(
      '\n',
    );

    const result = fixture.template.render(src, {}, options, fixture.vm);
    expect(result).toEqual('<p>.slm</p>');
  });

  test('test content default', () => {
    const options = {
      basePath: '/views',
    };

    options.filename = '/views/layouts/app.slm';

    fixture.vm.cache(
      options.filename,
      fixture.template.exec(
        [
          'html',
          '  head',
          '    = content("title", "default")',
          '      title Default title',
          '  body',
          '    = content()',
        ].join('\n'),
        options,
        fixture.vm,
      ),
    );

    options.filename = '/views/forms/form.slm';
    const src = ['- extend("../layouts/app")', 'p Body from view'].join('\n');

    const result = fixture.template.render(src, {}, options, fixture.vm);
    expect(result).toEqual(
      '<html><head><title>Default title</title></head><body><p>Body from view</p></body></html>',
    );

    const src2 = [
      '- extend("../layouts/app")',
      '= content("title")',
      '  title New title',
      'p Body from view',
    ].join('\n');

    const result2 = fixture.template.render(src2, {}, options, fixture.vm);
    expect(result2).toEqual(
      '<html><head><title>New title</title></head><body><p>Body from view</p></body></html>',
    );
  });

  test('test content append', () => {
    const options = {
      basePath: '/views',
    };

    options.filename = '/views/layouts/app.slm';

    fixture.vm.cache(
      options.filename,
      fixture.template.exec(
        [
          'html',
          '  head',
          '    = content("title")',
          '  body',
          '    = content()',
        ].join('\n'),
        options,
        fixture.vm,
      ),
    );

    options.filename = '/views/forms/form.slm';
    const src = [
      '- extend("../layouts/app")',
      '= content("title", "append")',
      '  title 1',
      'p Body from view',
    ].join('\n');

    const result = fixture.template.render(src, {}, options, fixture.vm);
    expect(result).toEqual(
      '<html><head><title>1</title></head><body><p>Body from view</p></body></html>',
    );

    const src2 = [
      '- extend("../layouts/app")',
      '= content("title", "prepend")',
      '  title 2',
      'p Body from view',
    ].join('\n');

    const result2 = fixture.template.render(src2, {}, options, fixture.vm);
    expect(result2).toEqual(
      '<html><head><title>2</title></head><body><p>Body from view</p></body></html>',
    );
  });

  test('test view loading', () => {
    const options = {
      basePath: `${__dirname}/views`,
      filename: `${__dirname}/views/index.slm`,
    };

    const src = FS.readFileSync(options.filename, 'utf8');

    const fn1 = compile(src, options);
    const res1 = fn1({});
    options.useCache = true;
    const fn2 = compile(src, options);
    const res2 = fn2({});
    options.useCache = false;
    const fn3 = compile(src, options);
    const res3 = fn3({});
    const expected =
      '<!DOCTYPE html><html><head><title>Nice</title><style type="text/css">body {background :red};</style></head><body><h1>Partial</h1><p>This is new footer</p></body><script>console.log(\'script\');</script><script type="text/javascript">console.log(\'javascript\');</script></html>';
    expect(res1).toEqual(expected);
    expect(res2).toEqual(expected);
    expect(res3).toEqual(expected);
  });

  test('test resolvePath', () => {
    const options = {
      filename: `${__dirname}/views/index.slm`,
    };

    const src = FS.readFileSync(options.filename, 'utf8');

    const fn1 = compile(src, options);
    expect(() => {
      fn1({});
    }).toThrow(
      'the "basePath" option is required to use with "absolute" paths',
    );

    const fn2 = compile(src, {});
    expect(() => {
      fn2({});
    }).toThrow(
      'the "filename" option is required to use with "relative" paths',
    );
  });
});
