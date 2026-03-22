import MultiFlattener from '../../lib/filters/multi_flattener.js';

describe('MultiFlattener', () => {

  let filter;

  beforeEach(() => {
    filter = new MultiFlattener();
  });

  test('flatten nested multi expressions', () => {
    expect(
      filter.exec(
        [
          'multi',
          ['static', 'a'],
          [
            'multi',
            ['dynamic', 'aa'],
            [
              'multi',
              ['static', 'aaa'],
              ['static', 'aab']
            ],
            ['dynamic', 'ab']
          ],
          ['static', 'b']
        ]
      )).toEqual(['multi',
        ['static', 'a'],
        ['dynamic', 'aa'],
        ['static', 'aaa'],
        ['static', 'aab'],
        ['dynamic', 'ab'],
        ['static', 'b']
      ]);
  });
});
