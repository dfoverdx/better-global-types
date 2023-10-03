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
  /**
   * Gets the keys of an object whose values are optional, `undefined`, or a union type including `undefined`.
   *
   * @example
   * type Foo = { a: undefined; b?: number; c: undefined | number, d: boolean };
   * type UndefinedKeysOfFoo = UndefinedKeys<Foo>; // 'a' | 'b' | 'c'
   */
  type UndefinedKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? K : never;
  }[keyof T];

  /** Extracts keys from `T` that are optional or can be `null` or `undefined`. */
  type NullishKeys<T> = Exclude<keyof T, NonNullishKeys<T>>;

  /** Extracts keys from `T` that are required and cannot be `null` or `undefined`. */
  type NonNullishKeys<T> = {
    [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? K : never;
  }[keyof T];

  /**
   * Gets the keys of an object whose values are optional.
   *
   * @example
   * type Foo = { a: undefined; b?: number; c: undefined | number, d: boolean };
   * type OptionalKeysOfFoo = OptionalKeys<Foo>; // 'b'
   */
  type OptionalKeys<T> = {
    [K in keyof T]-?: Omit<T, K> extends T ? K : never;
  }[keyof T];

  /**
   * Returns the keys that cannot be omitted from a the given type.
   *
   * Note, if an object has a property that *must* exist and `undefined` is a valid value, this key is still considered
   * required and will be included.
   *
   * @example
   *
   * type Foo = { a: undefined; b?: number; c: undefined | number, d: boolean };
   * type RequiredKeysOfFoo = RequiredKeys<Foo>; // 'a' | 'c' | 'd'
   */
  type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>;

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

  /**
   * Intellisense utility type.  Squashes a union type into a single, unified type.  Literal types are not squashed, but
   * are unioned with the squashed object.  To TSC, this is a no-op, but it makes unioned object types far more
   * readable.
   */
  type Squash<T> =
    // indexing literals with keyof T will result in an object with all of the literal's keys defined--the opposite of
    // squashing--so just union any literals outside of the squashed type.
    | Extract<T, Literal>
    | { [K in keyof Extract<T, NonLiteral>]: Extract<T, NonLiteral>[K]; };

  /** Applies {@link Squash | `Squash<T>`} an object and all its descendants. */
  type SquashDeep<T> =
    | Extract<T, Literal>
    | { [K in keyof Extract<T, NonLiteral>]: SquashDeep<Extract<T, NonLiteral>[K]>; };

  /** JavaScript literal types. */
  type Literal = string | number | boolean | bigint | symbol | null | undefined;

  /** JavaScript non-literal types. */
  type NonLiteral = Record<PropertyKey, unknown> | Function | readonly any[];

  /**
   * Merges two types `T` and `U`.  Where their properties differ, if at least one of those properties is a
   * {@link Literal}, returns the union of `T` and `U`.  Otherwise, applies `MergeUnion` recursively.
   *
   * If applied to two arrays or two objects, merges them.  If applied to an array and an object, returns the union of
   * the two.
   *
   * **Warning**: Will fail to merge two arrays if exactly one is readonly.  Will also fail if you try to merge a tuple
   * with an `unknown` or `any` element where that same index is defined in the other tuple.  The complexity of fixing
   * these was too high.
   */
  type MergeUnion<T, U> =
    // if T and U are both identical, just return T
    T | U extends T & U ? T : (
      // extract literals from T and U
      | Extract<T | U, Literal>
      // handle arrays separately because advanced TS types don't work well with arrays
      | __MergeUnionNonLiterals<Extract<T, readonly any[]>, Extract<U, readonly any[]>>
      | __MergeUnionNonLiterals<
          Exclude<Extract<T, NonLiteral>, readonly any[]>,
          Exclude<Extract<U, NonLiteral>, readonly any[]>
        >
    );

  /** @internal */
  type __MergeUnionNonLiterals<T extends NonLiteral, U extends NonLiteral> =
    // in case where neither T nor U are interesting, return never, which will be unioned away with the rest of the result
    IsNever<T | U> extends true ? never :
    // case where T did not include the required type before extraction
    IsNever<T> extends true ? U :
    // case where U did not include the required type before extraction
    IsNever<U> extends true ? T :
    Squash<(
      // pull out required props that are only in T or only in U
      & Omit<Pick<T, RequiredKeys<T>>, keyof U>
      & Omit<Pick<U, RequiredKeys<U>>, keyof T>
      // pull out optional props that are only in T or only in U
      & Omit<Pick<T, OptionalKeys<T>>, keyof U>
      & Omit<Pick<U, OptionalKeys<U>>, keyof T>
      // merge the remaining object properties recursively
      & {
          // if the property is optional in either T or U, make it optional in the result
          [K in keyof T & keyof U & (OptionalKeys<T> | OptionalKeys<U>)]?: __MergeUnionClashingProps<T[K], U[K]>;
        }
      & { [K in RequiredKeys<T> & RequiredKeys<U>]: __MergeUnionClashingProps<T[K], U[K]>; }
    )>;

  /** @internal */
  type __MergeUnionClashingProps<T, U> =
    T extends readonly any[]
      ? U extends readonly any[]
        // merge two arrays
        ? MergeUnion<T, U>
        // union an array and a non-array
        : T | U
      // merge two non-arrays
      : MergeUnion<T, U>;
}