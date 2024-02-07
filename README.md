# Kekka

A set of monad objects to simplify and clarify your business logic: 
- Result
- Optional

The first object is the Result Object inspired by Rust Result Monad. The second is the java inspired Optional.

## GOAL

## Managing unsuccessful but not erroneous return value

Never felt that something was missing in Javascript way of managing errors ?
A middle ground between returning `undefined` for business reasons and throwing Errors for business reasons.
 
```js
getUser(userId)  // returns undefined if no user found
  .then((user) => {
    if(!user) {
      // do stuff knowing user was not found
    } 
  })
```
Or throwing errors for business reasons ?
```js
getUser(userId)  // returns undefined if no user found
  .catch((error) => {
    if(error instanceof NoUserFoundError) {
      // do stuff knowing user was not found
    } 
  }) 
```
Ever heard about [Railway Programming ?](https://fsharpforfunandprofit.com/rop/) or the [Rust Result Monad ?](https://doc.rust-lang.org/std/result/enum.Result.html)

Wanting something like that in Javascript ? I did ! [Enter the `Result` class](docs/result.md).

## Defeating defensive programming

Tired of writing endless guard clauses like 
```js
if(!userName) {
  return
}
```
or 
```js
if(user && user.name) {
  // do something
}
```

Maybe want more elegant and explicit way to signal optional values in your business logic ? 
Look out for the [`Optional` class](docs/optional.md)

## Changelog

- v4.0: Add Optional Object
- v3.0: Fix broken import from different modules in mono-repo
- v2.0: Transcription to Typescript
  - Typescript Types
  - Suppression of enableResultPromiseHelpers function
  - Removal of support for non-native promises

## Documentation

Result Object Documentation
- [Result Class](docs/result.md#result-class)
    - [Build a Result](docs/result.md#build-a-result)
    - [Check Result type](docs/result.md#check-result-type)
    - [Get the associated value](docs/result.md#get-the-associated-value)
    - [Work only on successful value](docs/result.md#work-only-on-successful-value)
- [Using with promises](docs/result.md#using-with-promises)
    - [Configuration](docs/result.md#configuration)
    - [thenOnSuccess and thenOnFailure](docs/result.md#thenonsuccess-and-thenonfailure)

Optional Object Documentation
- [Optional Class](docs/optional.md#optional-class)
  - [Build an Optional](docs/optional.md#build-an-optional)
  - [Check Optional state](docs/optional.md#check-optional-state)
  - [Unwrap the optional value](docs/optional.md#unwrap-the-optional-value)
  - [Work only if optional has value](docs/optional.md#work-only-if-optional-has-value)
- [Using with Result Objects](docs/optional.md#using-with-result-objects)
  - [Optional.toResult](docs/optional.md#optionaltoresult)
  - [Result.toOptional](docs/optional.md#resulttooptional)

There is a chai plugin available to make sweeter assertions: [chai-kekka](https://github.com/apemb/chai-kekka).
