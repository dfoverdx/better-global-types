const TestSymbol = Symbol('test');

// Object.keys() tests
(): ('a' | 'b' | 'c' | '0')[] => Object.keys({ a: 1, b: true, c: { x: 1 }, 0: false });
(): ('a' | 'b' | 'c' | typeof TestSymbol)[] => Object.keys({ a: 1, b: true, c: { x: 1 }, [TestSymbol]: [] } as const);
(): ('a' | 'b')[] => Object.keys<{ a: 1, b?: true }>({ a: 1 });
(): ('0' | '1' | '2')[] => Object.keys([1, 2, 3] as const);

// Object.entries() tests
(): (['a', 1] | ['b', true] | ['c', { x: 1 }] | [typeof TestSymbol, 2])[] => Object.entries({ a: 1, b: true, c: { x: 1 }, [TestSymbol]: 2 } as const);
(): (['a', number] | ['b', boolean] | ['c', { x: number }] | [typeof TestSymbol, number])[] => Object.entries({ a: 1, b: true, c: { x: 1 }, [TestSymbol]: 2 });
(): (['a', number] | ['b', boolean | undefined])[] => Object.entries<{ a: 1, b?: true }>({ a: 1 });

// Object.fromEntries() tests
(): { a: 1; b: true; c: { x: 1; }; [TestSymbol]: 2 } => Object.fromEntries([['a', 1], ['b', true], ['c', { x: 1 }], [TestSymbol, 2]] as const);
(): { a: number; b: boolean; c: { x: number; }; } => Object.fromEntries(Object.entries({ a: 1, b: true, c: { x: 1 } }));
(): { a: number; b?: boolean; } => Object.fromEntries(Object.entries<{ a: 1, b?: true }>({ a: 1 }));