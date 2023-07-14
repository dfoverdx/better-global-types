@dfoverdx/better-global-types
=============================

Some augmentations of global methods that could be better.  I'll update these as I think of them.

This package has a peer requirement of `typescript@>=4.1.0` since it uses [template literal types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html).

Installation
------------

```sh
# npm
npm i -D @dfoverdx/better-global-types

# yarn
yarn add -D @dfoverdx/better-global-types
```

List of current augmentations
-----------------------------

### `ObjectConstructor` ###

#### `Object.keys()` ####

Return type now infers the actual keys of the object passed in.  When an array is passed in, knows only to return numeric keys (as strings) and any extra properties you may have attached to it--ones not on the array prototype.  It knows not to include `symbol`s.

##### Known issues #####

* Since TS currently has no way to infer an object's constructor, the type returned will include any prototype members as possible keys excluding those of `Object.prototype` and `Array.prototype`.

#### `Object.entries()` ####

Return type now infers the types of the key-value pairs of the object passed in, rather than `[string, T[keyof T]]`.  Like `Object.keys()`, it handles array properly.  It knows not to include tuples for `symbol` properties.

##### Known issues #####

* Since TS currently has no way to infer an object's constructor, the type returned will include key-value pairs of any prototype members as possible keys excluding those of `Object.prototype` and `Array.prototype`.

#### `Object.fromEntries()` ####

Return type now correctly infers the shape of the object.