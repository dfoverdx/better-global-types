interface ObjectConstructor {
  keys<T extends readonly any[]>(o: T): `${TSM.ArrayObjectKeys<T>}`[];
  keys<T extends {}>(o: T): `${Exclude<keyof T, symbol>}`[];

  entries<T extends readonly any[]>(o: T): { [K in keyof Required<T> & (string | number)]: [`${K}`, T[K]]; }[TSM.ArrayObjectKeys<T>][];
  entries<T extends {}>(o: T): { [K in Exclude<keyof Required<T>, symbol>]: [`${K}`, T[K]]; }[Exclude<keyof T, symbol>][];

  fromEntries<T extends readonly (readonly [PropertyKey, any])[]>(entries: T): TSM.MakeUndefinedValuesOptional<{
    [K in T[number][0]]: (T[number] & readonly [K, unknown])[1];
  }>;
}

declare function parseInt<T extends string | number>(s: T): TSM.ParseIntegerWithTail<T>;
declare function parseFloat<T extends string | number>(s: T): TSM.ParseNumberWithTail<T>;

interface Window {
  parseInt<T extends string | number>(s: T): TSM.ParseIntegerWithTail<T>;
  parseFloat<T extends string | number>(s: T): TSM.ParseNumberWithTail<T>;
}

interface NumberConstructor {
  parseInt<T extends string | number>(s: T): TSM.ParseIntegerWithTail<T>;
  parseFloat<T extends string | number>(s: T): TSM.ParseNumberWithTail<T>;
}

/**
 * **TypeScriptMagic**
 *
 * A namespace for more complicated utility types, so as not to pollute the global namespace.
 */
declare namespace TSM {
  /** Gets the keys of an object whose values are optional, `undefined`, or a union type including `undefined`. */
  type UndefinedKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? K : never;
  }[keyof T];

  /**
   * Gets the keys of an object that have a union type including `undefined` values, e.g. `'x'` in `{ x?: 1 }` and `{ x:
   * 1 | undefined }`. Intentionally does *not* capture keys whose values can only be `undefined`, e.g. `{ notCaptured:
   * undefined }` and `{ notCaptured?: undefined }`.
   */
  type MaybeUndefinedKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? T[K] extends undefined ? never : K : never;
  }[keyof T & (T extends any[] ? TSM.ArrayObjectKeys<T> : unknown)];

  /** Makes the values of an object that have `undefined` values optional. */
  type MakeUndefinedValuesOptional<T> = Omit<T, MaybeUndefinedKeys<T>> & Partial<Pick<T, MaybeUndefinedKeys<T>>>;

  /**
   * @internal
   *
   * Gets only the keys an array or tuple that are not defined on the `Array<T>` prototype. Resolves to `never` if the
   * array is empty (and there are no additionally defined keys--you can just set arbitrary string keys onto an array
   * object). This is useful for `Object.keys()` and `Object.entries()` of any array.
   *
   * **Warning**
   *
   * *Unless you understand exactly how this type works, I recommend you do not use this directly.*
   *
   * For tuples, this will correctly resolve to numeric indices as strings. For `T extends readonly any[]`, this will
   * return `number` rather than `` `${number}` ``. This is because TypeScript expects indices to be only numeric, and
   * so the definition for `Object.entries()` needs to index the arrays as `number`, not as `` `${number}` ``. This is
   * why this type is marked *@internal*.
   */
  type ArrayObjectKeys<T extends readonly any[]> =
    | Exclude<keyof Required<T>, symbol | keyof any[]>
    | (
      T extends readonly []
      ? never
      : T extends readonly [infer _, ...any] ? never : number
    );

  /** Applies `Partial<T>` to `T` and all descendants of `T`. */
  type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]>;
  };

  /** Applies `Required<T>` to `T` and all descendants of `T`. */
  type DeepRequired<T> = {
    [K in keyof T]-?: DeepRequired<T[K]>;
  }

  /** Applies `Readonly<T>` to `T` and all descendants of `T`. */
  type DeepReadonly<T> = {
    readonly [K in keyof T]: DeepReadonly<T[K]>;
  }

  /** Returns `true` if `T` is `any`, else `false`. */
  type IsAny<T> = 0 extends (1 & T) ? true : false;

  /** Returns `true` if `T` is `never`, else `false`. */
  type IsNever<T> = [T] extends [never] ? true : false;

  /**
   * Returns the numeric value of a string that is exactly a number. (Also works with numbers, in which case it's the
   * identity type.)
   */
  type ParseNumber<T extends string | number> =
    T extends number ? T :
    T extends `.${infer N extends number}` ? ParseNumber<`0.${N}`> :
    T extends `${infer N extends number}.` ? N :
    // handle case where the last digit is a 0
    T extends `${infer N extends number}.${infer U}0` ? ParseNumber<`${N}.${U}`> :
    T extends `${infer N extends number}` ? N :
    never;

  /**
   * Returns the numeric value at the front of a string. (Also works with numbers, in which case it's the identity
   * type.)
   *
   * **Warning**
   *
   * Will run into issues with strings > 50 characters long due to TypeScript's limitations on recursive types.
   */
  type ParseNumberWithTail<T extends string | number> =
    T extends number ? T :
    T extends `${number}` ? ParseNumber<T> :
    T extends `${infer N extends number}${infer U}`
      ? U extends `${number}${string}`
        ? U extends `-${string}`
          ? N
          : U extends `${infer Head extends number}.${infer Tail extends number}${string}`
            // handle parsing of things like `1.1.1`
            ? `${Head}` extends `${string}.${string}`
              ? TSM.ParseNumber<`${N}.${ParseIntegerWithTail<Head>}`>
              : TSM.ParseNumber<`${N}${ParseInteger<Head>}.${ParseIntegerWithTail<Tail>}`>
            : TSM.ParseNumber<`${N}${ParseNumberWithTail<U>}`>
      : U extends `${number}${string}`
        ? TSM.ParseNumber<`${N}${ParseNumberWithTail<U>}`>
        : U extends `.${infer Decimal extends number}${string}`
          ? TSM.ParseNumber<`${N}.${ParseIntegerWithTail<Decimal>}`>
          : N :
    never;

  /**
   * Returns the number value of a string or number that is an integer. Returns `never` if the input is a float or a
   * string that is not an integer.
   */
  type ParseInteger<T extends string | number> =
    T extends number ? ParseInteger<`${T}`> :
    T extends `${infer I extends number}` ? T extends `${number}.${number}` ? never : I :
    never;

  /**
   * Returns the integer value at the front of a string, or truncates float to be an integer (i.e. the return value of
   * `parseInt(myFloatingPointNumber)`). Returns `never` if the input a string that does not begin with an integer.
   *
   * **Warning**
   *
   * Will run into issues with strings starting with numbers > 50 characters long due to TypeScript's limitations on
   * recursive types. However, such a number would be far greater than `Number.MAX_SAFE_INTEGER` anyway.
   */
  type ParseIntegerWithTail<T extends string | number> =
    T extends number ? ParseInteger<`${T}`> :
    T extends `-.${infer U extends number}`
      ? `${U}` extends `-${number}`
        ? never
        : 0 :
    T extends `${infer I extends number}.${string}`
      ? I
      : T extends `${infer I extends number}${infer U}`
        ? U extends `${number}${string}`
          ? TSM.ParseInteger<`${I}${ParseIntegerWithTail<U>}`>
        : I :
    never;
}