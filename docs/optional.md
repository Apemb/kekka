# Optional Object Documentation

- [Optional Class](optional.md#optional-class)
    - [Build an Optional](optional.md#build-an-optional)
    - [Check Optional state](optional.md#check-optional-state)
    - [Unwrap the optional value](optional.md#unwrap-the-optional-value)
    - [Work only if optional has value](optional.md#work-only-if-optional-has-value)
- [Using with Result Objects](optional.md#using-with-result-objects)
    - [Optional.toResult](optional.md#optionaltoresult)
    - [Result.toOptional](optional.md#resulttooptional)

## Optional class

map<NextValue>(callback: mapFunctionCallback<Value, NextValue>): Optional<NextValue>


An Optional can be in two states: either it has Some associated value or it is Empty.

### Build an Optional
```ts
// An optional can be created from a not null nor undefined value like so
const userNameOptional1 = Optional.of('Francis')
// or an alias for the same thing 
const userNameOptional2 = Some('Francis')

// An empty optional can be created with empty but the type has to be added manually
const userNameOptional3 = Optional.empty<string>()
// or an alias for the same thing 
const userNameOptional4 = Empty<string>()

// In case you do not know if the value you have is or not undefined or null, you can
// use ofNullable, that wraps that potentially undefined value into either an empty optional or
// a optional with an associated value
const undefinedUserName: string | undefined = undefined
const emptyOptional = Optional.ofNullable(undefinedUserName)

const filledUserName: string | undefined = 'Bernard'
const filledOptional = Optional.ofNullable(filledUserName)
``` 

### Check Optional state

One can check the state of an Optional by calling `isSome` or `isEmpty` methods.
```js
const filledOptional = Optional.some('a value')

filledOptional.isSome() // true
filledOptional.isEmpty() // false

const emptyOptional = Optional.empty<string>()

emptyOptional.isSome() // false
emptyOptional.isEmpty() // epty
``` 

### Unwrap the optional value

One can want to get the associated value from inside the Optional.
There are three safe way of doing so to match as best possible any workflow, orElse, orElseGet, orElseThrow
```ts
const filledOptional = Optional.some('a value')
const emptyOptional = Optional.empty<string>()

// orElse will return the backupValue if the optional is empty,
// or the associated value if not
const backupValue = 'a backup value' 
const value1 = filledOptional.orElse(backupValue) // 'a value'
const value2 = emptyOptional.orElse(backupValue) // 'a backup value'

// orElseGet will return a resolved promise with optinal value,
// or the promise returned by the callback if optional was empty
const backupCallback = () => database.getValue() // Promise<'database value'>
const value3 = filledOptional.orElseGet(backupCallback) // Promise<'a value'>
const value4 = emptyOptional.orElseGet(backupCallback) // Promise<'database value'>

// orElseThrow will return the optinal value,
// or throw the error passed as parameter
const error = new Error('the optional was empty')
const value5 = filledOptional.orElseThrow(error) // 'a value'
const value6 = emptyOptional.orElseThrow(error) // Error('the optional was empty')
``` 

### Work only if optional has value

To avoid unwrapping results every line, one can use the `.map` function.

```ts
const filledOptional = Optional.some('a value')
filledOptional.map((value) => { // value > 'a value'
  return 'another value'
}) // returns Optional.some('another value')

const emptyOptional = Optional.empty<string>()
emptyOptional.map((value) => { // value > 'a value'
  return 'another value'
}) // returns Optional.empty()
``` 

## Using with Result Objects

It is often useful to switch from Optional to Result objects and vice versa.

### Optional.toResult

One can convert an Optional to a Result with the `toResult` function.
If the Optional is empty then the Result will be a Failure with the error passed as parameter. 
If the Optional has an associated value then the Result will be a Success with the associated value.

```ts
const filledOptional = Optional.some('a value')
filledOptional.toResult(new Error('a failure')) // returns Result.Success('a value')

const emptyOptional = Optional.empty<string>()
emptyOptional.toResult(new Error('a failure')) // returns Result.Failure(new Error('a failure'))
```

### Result.toOptional

One can convert a Result to an Optional with the `toOptional` function.
If the Result is a Success then the Optional will be Some with the associated value.
If the Result is a Failure then the Optional will be Empty.

```ts
const successResult = Result.fromSuccess('a value')
successResult.toOptional() // returns Optional.some('a value')

const failureResult = Result.fromFailure(new Error('a failure'))
failureResult.toOptional() // returns Optional.empty()
```

On the special cases where the result is a success with an undefined or null value, the optional will be empty.

```ts
const successResult = Result.fromSuccess(undefined)
successResult.toOptional() // returns Optional.empty()
```
