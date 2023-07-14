interface ObjectConstructor {
  keys<T extends readonly any[]>(o: T): `${TSM.IterableArrayKeys<T>}`[];
  keys<T extends {}>(o: T): `${Exclude<keyof T, symbol>}`[];

  entries<T extends readonly any[]>(o: T): { [K in keyof Required<T> & (string | number)]: [`${K}`, T[K]]; }[TSM.IterableArrayKeys<T>][];
  entries<T extends {}>(o: T): { [K in Exclude<keyof Required<T>, symbol>]: [`${K}`, T[K]]; }[Exclude<keyof T, symbol>][];

  fromEntries<T extends readonly (readonly [PropertyKey, unknown])[]>(entries: T): TSM.MakeUndefinedValuesOptional<{
    [K in T[number][0]]: Extract<T[number], readonly [K, any]>[1];
  }>;
}

/**
 * TypeScriptMagic
 *
 * A namespace for more complicated utility types, so as not to pollute the global namespace.
 */
declare namespace TSM {
  type UndefinedKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? T[K] extends undefined ? never : K : never;
  }[keyof T];

  type MakeUndefinedValuesOptional<T> = Omit<T, UndefinedKeys<T>> & Partial<Pick<T, UndefinedKeys<T>>>;

  type IterableArrayKeys<T extends readonly any[]> =
    | Exclude<keyof Required<T>, symbol | keyof any[]>
    | (
        T extends readonly []
          ? never
          : T extends readonly [infer _, ...any] ? never : number
      );
}