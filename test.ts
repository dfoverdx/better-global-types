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
    0,
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
    ['c', { x: 'a' }],
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
    ['3', 4],
    // @ts-expect-error
    [TestSymbol, 2],
  ];
}

// Object.fromEntries() tests
(): { a: 1; b: true; c: { x: 1; };[TestSymbol]: 2 } => Object.fromEntries([['a', 1], ['b', true], ['c', { x: 1 }], [TestSymbol, 2]] as const);
(): { a: number; b: boolean; c: { x: number; }; } => Object.fromEntries(Object.entries({ a: 1, b: true, c: { x: 1 } }));
(): { a: number; b?: boolean; } => Object.fromEntries(Object.entries<{ a: 1, b?: true }>({ a: 1 }));
// @ts-expect-error
(): { a: number; b: boolean; } => Object.fromEntries(Object.entries<{ a: 1, b?: true }>({ a: 1 }));
{
  // test for union-type keys
  type Key = 'a' | 'b';
  type Foo = Record<Key, Record<number, number>>;

  const x = Object.fromEntries<[Key, Foo[Key]][]>([['a', { 1: 1 }], ['b', { 2: 2 }]]);
  type Test = Foo extends typeof x ? true : false;
  const test: Test = true;
}

// parseFloat() tests
(): 0.1 => parseFloat('.1');
(): 0.1 => parseFloat('0.1');
(): 1 => parseFloat('1');
(): 1 => parseFloat('1.');
(): 1 => parseFloat('1.0');
(): 1 => parseFloat('1.00');
(): 10 => parseFloat('10');
(): 10 => parseFloat('10.0');
(): 10.1 => parseFloat('10.1');
(): 10 => parseFloat('10. and stuff');
(): 1.1 => parseFloat('1.1');
(): 1.1 => parseFloat('1.1 and stuff');
(): -1.1 => parseFloat('-1.1');
(): 1.1 => parseFloat(1.1);
(): 10.1 => parseFloat('10.1.1');
{
  let x = parseFloat('.');
  // @ts-expect-error
  x = 1;
}

// parseInt() tests
(): 0 => parseInt('0');
(): 1 => parseInt('1');
(): 1 => parseInt('1.0');
(): 10 => parseInt('10');
(): 10 => parseInt('10 and other things');
(): 1 => parseInt('1.1');
(): 1 => parseInt('1.1 and other things');
(): 0 => parseInt('-.1');
(): 1 => parseInt(1);
(): 1 => parseInt(1.1);
(): 10 => parseInt(10);
(): -1 => parseInt('-1');
(): -1 => parseInt('-1.1');
// @ts-expect-error
(): 2 => parseInt(1);
// @ts-expect-error
(): 2 => parseInt('1');
// @ts-expect-error
(): 2 => parseInt('1.2');

// TSM.ParseNumber tests
(): TSM.ParseNumber<1.1> => 1.1;
(): TSM.ParseNumber<'1.1'> => 1.1;
(): TSM.ParseNumber<-.1> => -.1;
(): TSM.ParseNumber<'-.1'> => -.1;
// @ts-expect-error
(): TSM.ParseNumber<1.1> => 1;
// @ts-expect-error
(): TSM.ParseNumber<1.1> => 1.2;
// @ts-expect-error
(): TSM.ParseNumber<'1.1'> => 1;
// @ts-expect-error
(): TSM.ParseNumber<'1.1'> => 2;

// TSM.ParseNumber tests
(): TSM.ParseNumber<1.1> => 1.1;
(): TSM.ParseNumber<'1.1'> => 1.1;

// TSM.ParseInteger tests
(): TSM.ParseInteger<'1'> => 1;

// TSM.IsAny tests
(): true => true as TSM.IsAny<any>;
(): false => false as TSM.IsAny<unknown>;
(): false => false as TSM.IsAny<never>;
(): false => false as TSM.IsAny<number>;

// TSM.IsNever tests
(): true => true as TSM.IsNever<never>;
(): false => false as TSM.IsNever<any>;
(): false => false as TSM.IsNever<unknown>;
(): false => false as TSM.IsNever<number>;

// TSM.DeepReadonly tests
{
  const x: TSM.DeepReadonly<{ a: 1, b: { c: 2 }, d: Record<string, number> }> = { a: 1, b: { c: 2 }, d: {} };
  // @ts-expect-error
  x.a = 2;
  // @ts-expect-error
  x.b.c = 3;
  // @ts-expect-error
  x.d.foo = 4;
}

// TSM.DeepRequired tests
(): TSM.DeepRequired<{ a?: 1, b?: { c?: 2 } }> => ({ a: 1, b: { c: 2 } });
// @ts-expect-error
(): TSM.DeepRequired<{ a?: 1, b?: { c?: 2 } }> => ({ b: { c: 2 } });
// @ts-expect-error
(): TSM.DeepRequired<{ a?: 1, b?: { c?: 2 } }> => ({ a: 1, b: {} });

// TSM.DeepPartial tests
(): TSM.DeepPartial<{ a: 1, b: { c: 2 } }> => ({});
(): TSM.DeepPartial<{ a: 1, b: { c: 2 } }> => ({ a: 1 });
(): TSM.DeepPartial<{ a: 1, b: { c: 2 } }> => ({ b: {} });
(): TSM.DeepPartial<{ a: 1, b: { c: 2 } }> => ({ b: { c: 2 } });
(): TSM.DeepPartial<{ a: 1, b: { c: 2 } }> => ({ a: undefined, b: { c: 2 } });
// @ts-expect-error
(): TSM.DeepPartial<{ a: 1, b: { c: 2 } }> => ({ d: 1 });
// @ts-expect-error
(): TSM.DeepPartial<{ a: 1, b: { c: 2 } }> => ({ a: 2 });
// @ts-expect-error
(): TSM.DeepPartial<{ a: 1, b: { c: 2 } }> => ({ b: [] });
// @ts-expect-error
(): TSM.DeepPartial<{ a: 1, b: { c: 2 } }> => ({ b: { d: 2 } });

// TSM.UndefinedKeys tests
(): TSM.UndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'b';
(): TSM.UndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'c';
(): TSM.UndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'd';
(): TSM.UndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'e';
// @ts-expect-error
(): TSM.UndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'a';
// @ts-expect-error
(): TSM.UndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'f';

// TSM.MaybeUndefinedKeys tests
(): TSM.MaybeUndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'b';
(): TSM.MaybeUndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'c';
(): TSM.MaybeUndefinedKeys<[ undefined, 1 | undefined, 2? ]> => '1';
(): TSM.MaybeUndefinedKeys<[ undefined, 1 | undefined, 2? ]> => '2';
// @ts-expect-error
(): TSM.MaybeUndefinedKeys<[ undefined, 1 | undefined, 2? ]> => 3;
// @ts-expect-error
(): TSM.MaybeUndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'a';
// @ts-expect-error
(): TSM.MaybeUndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'd';
// @ts-expect-error
(): TSM.MaybeUndefinedKeys<{ a: 1, b?: 2, c: 3 | undefined, d: undefined, e?: undefined }> => 'e';
// @ts-expect-error
(): TSM.MaybeUndefinedKeys<[ undefined, 1 | undefined, 2? ]> => '0';
// @ts-expect-error
(): TSM.MaybeUndefinedKeys<[ undefined, 1 | undefined, 2? ]> => 0;
// @ts-expect-error
(): TSM.MaybeUndefinedKeys<[ undefined, 1 | undefined, 2? ]> => 1;