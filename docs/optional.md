# Optional Object Documentation

- [Result Class](result.md#result-class)
    - [Build a Result](result.md#build-a-result)
    - [Check Result type](result.md#check-result-type)
    - [Get the associated value](result.md#get-the-associated-value)
    - [Work only on successful value](result.md#work-only-on-successful-value)
- [Using with promises](result.md#using-with-promises)
    - [Configuration](result.md#configuration)
    - [thenOnSuccess and thenOnFailure](result.md#thenonsuccess-and-thenonfailure)

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
const successResult = Result.fromSuccess('a success')

successResult.onSuccess((successValue) => {
  // successValue > 'a success'
  return Result.fromSuccess('another success')
}) // returns Result.Success with ('another success') associated value

const failureResult = Result.fromFailure(new Error('failure'))

failureResult.onSuccess((successValue) => {
  // Will not be called
  return Result.fromSuccess('another success')
}) // Result.Failure with (Error('failure')) associated valued
``` 

## Using with promises

In javascript, most actions are asynchronous. To ease the usage of the result object, helpers can
be monkey-pactched into the projet’s Promise class of choice. It is a purely opt-in
process. 

### Configuration
To add with the following asynchronous promise helper functions, the package must just be required when starting the project.
That way, native Promise will be embellished with those functions.
This package must be called at least once per project, and before any usage of the following asynchronous promise helper functions. 
 
### thenOnSuccess and thenOnFailure

To keep the three way flow - happy path, business failure, unexpected error - Successes and Failures are to be treated
differently from errors. One can use `thenOnSuccess` and `thenOnFailure` to run callbacks only if the result
of the previous promise is a Result.Success or a Result.Failure. 

Those functions will call the callback with the associated value of the result.
 If it is a `Success` then the next `thenOnSuccess` callback will be called with the result associated value as argument.
 If it is a `Failure` then the next `thenOnFailure` callback will be called with the result associated value as argument.
 
```js
const successfulResult = Success('some value')
const failureResult = Failure(new Error('failure'))
const nonResultValue = 34243

Promise.resolve(successfulResult)
  .thenOnSuccess(sucessValue => { // Will be called
    return Success(sucessValue + ' and more')
  }) 
  .thenOnFailure(associatedError => { // Will not be called
    return Success('Return from error')
  }) 
  // will return a promise that will resolve Result.Success('some value and more')


Promise.resolve(failureResult)
  .thenOnSuccess(sucessValue => { // Will not be called
    return Success(sucessValue + ' and more')
  })
  .thenOnFailure(associatedError => { // Will be called
    return Failure(new Error('another failure'))
  })
 // will return a promise that will resolve Failure(new Error('another failure'))

Promise.resolve(nonResultValue)
  .thenOnSuccess(sucessValue => { // Will never be called
    return Success(sucessValue + ' and more')
  }) // will return a promise that will resolve nonResultValue
```

The functions `thenOnSuccess` and `thenOnFailure` work as promises in the way that if you return a promise in 
the callback that promise will be waited on before returning the resolved result as the argument of the rest of
the promise chain.

Also it works as `onSuccess` and `onFailure` for the returned values that are not `Result`. If it is a `Success` or 
a `Failure` then it is returned as it is in the rest of the promise chain. But if the returned value of the callback is 
not a `Result` then the value is wrapped in a `Success`.    

Thrown errors will still go to the next `catch` callback and will not be wrapped in any `Result`.

```js
Promise.resolve(Success('some value'))
  .thenOnSuccess(sucessValue => { 
    return 'Some string'
  }) 
  .then(arg => { 
    // Will be called
    // arg will be a Result.Success with 'Some string' as associated value
  }) 

Promise.resolve(Success('some value'))
  .thenOnSuccess(sucessValue => { // Will not be called
    return Failure(new Error('a failure'))
  })
  .then(arg => { 
    // Will be called
    // arg will be a Result.Failure with new Error('a failure') as associated value
  })

Promise.resolve(Success('some value'))
  .thenOnSuccess(sucessValue => { // Will not be called
    const anObject = {a: 42}
    return Promise.resolve(anObject)
  })
  .then(arg => { 
    // Will be called
    // arg will be a Result.Success with anObject as associated value
  })


Promise.resolve(nonResultValue)
  .thenOnSuccess(sucessValue => { // Will never be called
    throw new Error('thrown erre')
  })
  .then(arg => { 
    // Will not be called
  })
  .catch(error => {
    // Will be called with new Error('thrown erre')
  })
```

### resolveFromSuccess and resolveFromFailure

For ease of usage `Promise.resolve(Success(value))` can be written `Promise.resolveFromSuccess(value)`. 
The same things exists for `Promise.resolve(Failure(error))` as `Promise.resolveFromFailure(error)`

