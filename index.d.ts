interface ObjectConstructor {
    keys<T>(o: T): (keyof T)[];

    entries<T>(o: T): {
        [K in keyof Required<T>]: [K, T[K]];
    }[keyof T][];

    fromEntries<T extends readonly (readonly [PropertyKey, unknown])[]>(entries: T): TypesScriptMagic.MakeUndefinedValuesOptional<{
        [K in T[number][0]]: Extract<T[number], readonly [K, any]>[1];
    }>;
}

/** A namespace for more complicated types, so as not to pollute the global namespace. */
declare namespace TypesScriptMagic {
    type UndefinedKeys<T> = {
        [K in keyof T]-?: undefined extends T[K] ? T[K] extends undefined ? never : K : never;
    }[keyof T];

    type MakeUndefinedValuesOptional<T> = Omit<T, UndefinedKeys<T>> & Partial<Pick<T, UndefinedKeys<T>>>;
}