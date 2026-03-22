import Generator from '../../lib/generators/string.js';

describe('String generator', () => {
  let generator = null;

  beforeEach(() => {
    generator = new Generator();
  });

  test('compiles simple expressions', () => {
    expect(generator.exec(['static', 'test'])).toEqual(
      'var _b=\'\';_b+="test";',
    );
    expect(generator.exec(['dynamic', 'test'])).toEqual("var _b='';_b+=test;");
    expect(generator.exec(['code', 'test'])).toEqual("var _b='';test");
  });

  test('compiles multi expression', () => {
    expect(
      generator.exec([
        'multi',
        ['static', 'static'],
        ['dynamic', 'dynamic'],
        ['code', 'code'],
      ]),
    ).toEqual('var _b=\'\';_b+="static";\n_b+=dynamic;\ncode');
  });

  test('throws an error on unknown expression', () => {
    expect(() => {
      generator.exec(['multi', ['unknown', 'static'], ['code', 'code']]);
    }).toThrow(
      'Generator supports only core expressions - found ["unknown","static"]',
    );
  });
});
