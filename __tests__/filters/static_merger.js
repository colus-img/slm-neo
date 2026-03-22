import StaticMerger from '../../lib/filters/static_merger.js';

describe('StaticMerger', () => {

  let filter;

  beforeEach(() => {
    filter = new StaticMerger();
  });

  test('merge serveral statics', () => {
    expect(
      filter.exec(['multi',
        ['static', 'Hello '],
        ['static', 'World, '],
        ['static', 'Good night']
      ])).toEqual(
      ['static', 'Hello World, Good night']
    );
  });

  test('merge serveral statics around code', () => {
    expect(
      filter.exec(['multi',
        ['static', 'Hello '],
        ['static', 'World!'],
        ['code', '123'],
        ['static', 'Good night, '],
        ['static', 'everybody']
      ])).toEqual(
        ['multi',
        ['static', 'Hello World!'],
        ['code', '123'],
        ['static', 'Good night, everybody']
      ]);
  });

  test('merge serveral statics across newlines', () => {
    expect(
      filter.exec(['multi',
        ['static', 'Hello '],
        ['static', 'World, '],
        ['newline'],
        ['static', 'Good night']
      ])).toEqual(
        ['multi',
        ['static', 'Hello World, Good night'],
        ['newline']
    ]);
  });
});
