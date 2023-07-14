const TestSymbol = Symbol('test');

type AugmentedArray<T extends readonly any[]> = T & {
  foo?: string;
  [TestSymbol]: number;
}

const augArr = [1, 2, 3] as AugmentedArray<[1, 2, 3]>;

// Object.keys() tests
{
  const r = Object.keys({ a: 1, b: true, c: { x: 1 }, 0: false, [TestSymbol]: [] });
  const _: typeof r[number][] = [
    'a', 'b', 'c', '0',
    // @ts-expect-error
    TestSymbol,
    // @ts-expect-error
    'd',
  ];
}
{
  const r = Object.keys<{ a: 1, b?: true }>({ a: 1 });
  const _: typeof r[number][] = [
    'a', 'b',
    // @ts-expect-error
    'c',
  ];
}
{
  const r = Object.keys([1, 2, 3] as const);
  const _: typeof r[number][] = [
    '0', '1', '2',
    // @ts-expect-error
    '3',
    // @ts-expect-error
    'foo',
  ];
}
{
  const r = Object.keys<number[]>([1, 2, 3]);
  const _: typeof r[number][] = [
    '0', '1', '2', '4',
    // @ts-expect-error
    'foo',
  ];
}
{
  const r = Object.keys(augArr);
  const _: typeof r[number][] = [
    '0', '1', '2', 'foo',
    // @ts-expect-error
    TestSymbol,
    // @ts-expect-error
    'd',
  ];
}

// Object.entries() tests
{
  const r = Object.entries({ a: 1, b: true, c: { x: 1 }, [TestSymbol]: 2 } as const);
  const _: typeof r[number][] = [
    ['a', 1], ['b', true], ['c', { x: 1 }],
    // @ts-expect-error
    [TestSymbol, 2],
    // @ts-expect-error
    ['d', 3],
    // @ts-expect-error
    ['a', 'b'],
  ]
}
{
  const r = Object.entries({ a: 1, b: true, c: { x: 1 }, [TestSymbol]: 2 });
  const _: typeof r[number][] = [
    ['a', 0], ['b', false], ['c', { x: 2 }],
    // @ts-expect-error
    ['c', { x: 'a'} ],
    // @ts-expect-error
    [TestSymbol, 2],
    // @ts-expect-error
    ['d', 3],
  ];
}
{
  const r = Object.entries<{ a: 1, b?: true }>({ a: 1 });
  const _: typeof r[number][] = [
    ['a', 1], ['b', undefined], ['b', true],
    // @ts-expect-error
    undefined,
  ];
}
{
  const r = Object.entries([1, 2, 3] as const);
  const _: typeof r[number][] = [
    ['0', 1], ['1', 2], ['2', 3],
    // @ts-expect-error
    ['3', 4],
    // @ts-expect-error
    [0, 1],
  ];
}
{
  const r = Object.entries<number[]>([1, 2, 3]);
  const _: typeof r[number][] = [
    ['0', 1], ['1', 2], ['2', 3], ['3', 4],
    // @ts-expect-error
    [1, 1]
  ];
}
{
  const r = Object.entries(augArr);
  const _: typeof r[number][] = [
    ['0', 1], ['1', 2], ['2', 3], ['foo', 'bar'], ['foo', undefined],
    // @ts-expect-error
    [TestSymbol, 2],
  ];
}

// Object.fromEntries() tests
(): { a: 1; b: true; c: { x: 1; }; [TestSymbol]: 2 } => Object.fromEntries([['a', 1], ['b', true], ['c', { x: 1 }], [TestSymbol, 2]] as const);
(): { a: number; b: boolean; c: { x: number; }; } => Object.fromEntries(Object.entries({ a: 1, b: true, c: { x: 1 } }));
(): { a: number; b?: boolean; } => Object.fromEntries(Object.entries<{ a: 1, b?: true }>({ a: 1 }));
// @ts-expect-error
(): { a: number; b: boolean; } => Object.fromEntries(Object.entries<{ a: 1, b?: true }>({ a: 1 }));