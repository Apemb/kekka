# Result Object Documentation

- [Result Class](result.md#result-class)
    - [Build a Result](result.md#build-a-result)
    - [Check Result type](result.md#check-result-type)
    - [Get the associated value](result.md#get-the-associated-value)
    - [Work only on successful value](result.md#work-only-on-successful-value)
- [Using with promises](result.md#using-with-promises)
    - [Configuration](result.md#configuration)
    - [thenOnSuccess and thenOnFailure](result.md#thenonsuccess-and-thenonfailure)

## Result class

A Result can be two things: either a Success (ie the happy path) or a Failure (something did not 
go on the happy path, but not in a catastrophic way, more in a manageable way).

### Build a Result
```js
// A success is an instance of the Result class build using the fromSuccess factory method
const userResult = Result.fromSuccess(user)
// or an alias for the same thing 
const userResult = Success(user)

// A failure is an instance of the Result class build using the fromFailure factory method
const userResult = Result.fromFailure(new UserNotFoundError())
// or an alias for the same thing 
const userResult = Failure(new UserNotFoundError())
``` 

### Check Result type

One can check the result type by calling `isSuccess` or `isFailure` methods.
```js
const successResult = Result.fromSuccess('a success')

successResult.isSuccess() // true
successResult.isFailure() // false

const failureResult = Result.fromFailure(new Error('failure'))

failureResult.isSuccess() // false
failureResult.isFailure() // true
``` 

### Get the associated value

One can want to get the associated value from the Result. Use `unwrap()` for that. `unwrap()` returns
the associated value when successful and throws the associated error when a failure.
```js
const successResult = Result.fromSuccess('a success')

successResult.unwrap() // returns 'a success'

const failureResult = Result.fromFailure(new Error('failure'))

successResult.unwrap() // throws error
``` 

### Work only on successful value

To avoid unwrapping results every line, one can use the `.onSuccess` function.

```js
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
A `.onFailure` function exists as well. Those functions take one argument, 
a callback, that receives as first argument the associated value (success or failure)
and returns a Success or Failure. The functions then returns a Result object, either
Success or Failure. For ease of use, if that callback returns any value other than a 
Result object (even `undefined`) that value will be wrapped into a Success result.    

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

