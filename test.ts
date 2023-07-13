// Object.keys() tests
(): ('a' | 'b' | 'c')[] => Object.keys({ a: 1, b: true, c: { x: 1 } });
(): ('a' | 'b' | 'c')[] => Object.keys({ a: 1, b: true, c: { x: 1 } } as const);
(): ('a' | 'b')[] => Object.keys<{ a: 1, b?: true }>({ a: 1 });

// Object.entries() tests
(): (['a', 1] | ['b', true] | ['c', { x: 1 }])[] => Object.entries({ a: 1, b: true, c: { x: 1 } } as const);
(): (['a', number] | ['b', boolean] | ['c', { x: number }])[] => Object.entries({ a: 1, b: true, c: { x: 1 } });
(): (['a', number] | ['b', boolean | undefined])[] => Object.entries<{ a: 1, b?: true }>({ a: 1 });

// Object.fromEntries() tests
(): { a: 1; b: true; c: { x: 1; }; } => Object.fromEntries([['a', 1], ['b', true], ['c', { x: 1 }]] as const);
(): { a: number; b: boolean; c: { x: number; }; } => Object.fromEntries(Object.entries({ a: 1, b: true, c: { x: 1 } }));
(): { a: number; b?: boolean; } => Object.fromEntries(Object.entries<{ a: 1, b?: true }>({ a: 1 }));