import ControlFlow from '../../lib/filters/control_flow.js';

describe('ControlFlow', () => {

  let filter;

  beforeEach(() => {
    filter = new ControlFlow();
  });

  test('should process blocks', () => {
    expect(
      filter.exec(['block', 'while (true)', ['static', 'Hello']])
    ).toEqual(
      ['multi',
        ['code', 'while (true)'],
        ['static', 'Hello']
      ]
    );
  });

  test('should process if', () => {
    expect(
      filter.exec(['if', 'condition', ['static', 'Hello']])
    ).toEqual(
      ['multi',
        ['code', 'if(condition){'],
        ['static', 'Hello'],
        ['code', '}']
      ]
    );
  });

  test('should process if with else', () => {
    expect(
      filter.exec(['if', 'condition', ['static', 'True'], ['static', 'False']])
    ).toEqual(
      ['multi',
        ['code', 'if(condition){'],
        ['static', 'True'],
        ['code', '}else{'],
        ['static', 'False'],
        ['code', '}']
      ]
    );
  });

});
