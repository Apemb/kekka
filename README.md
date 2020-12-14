# Kekka

A Result Object inspired by Rust Result Monad.

## GOAL

Never felt that something was missing in Javascript way of managing errors ?
A middle ground between returning `undefined` for business reasons.
 
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

Wanting something like that in Javascript ? I did ! Enter the `Result` class.

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
}) // returns Result.Success with ('a success') associated value

const failureResult = Result.fromFailure(new Error('failure'))

 failureResult.onSuccess((successValue) => {
// Will not be called
return Result.fromSuccess('another success')
}) // Result.Failure with (Error('failure')) associated valued
``` 
A `.onFailure` function exists as well. Those functions take one argument, 
a callback, that receives as first argument the associated value (success or failure)
and returns a Success or Failure. The functions than returns a Result object, either
Success or Failure. For ease of use, if that callback returns any value other than a 
Result object (even `undefined`) that value will be wrapped into a Success result.    

