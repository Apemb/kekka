import { Result, Success, Failure } from './result'

// interface PromiseConstructor {
//   // thenOnSuccess<Value, NextValue> (callback: (value: Value | Error) => NextValue | Result<NextValue> | Promise<Result<NextValue>>): NextValue | Result<NextValue> | Promise<Result<NextValue>>
//   resolveFromSuccess<Value> (value: Value): Result<Value>,
//   resolveFromFailure<Value> (value: Error): Result<Value>,
// }

export function enableResultPromiseHelpers (promise: Promise<any>) {
  const wrapValueInResult = function<Value> (value: Value): Result<Value> {
    if (value instanceof Result) {
      return value
    } else {
      return Success(value)
    }
  }
  const wrapValueInResultAsync = function<Value> (value: Value): Result<Value> | Promise<Result<Value>> {
    if (value instanceof Promise) {
      return value.then(wrapValueInResult)
    } else {
      return wrapValueInResult(value)
    }
  }

  class ResultPromise extends Promise<any> {
    constructor(callback: any | undefined) {
      super(callback)
    }

    static resolveFromSuccess<Value> (value: Value): Promise<Result<Value>> {
      return ResultPromise.resolve(Success(value))
    }

    static resolveFromFailure<Value> (value: Error): Promise<Result<Value>> {
      return ResultPromise.resolve(Failure(value as Error))
    }

    thenOnSuccess<Value, NextValue> (callback: (value: Value | Error) => NextValue | Result<NextValue> | Promise<Result<NextValue>>): NextValue | Result<NextValue> | Promise<Result<NextValue>> {
      return this.then(promiseReturnedValue => {
        if (promiseReturnedValue instanceof Result && promiseReturnedValue.isSuccess()) {
          return wrapValueInResultAsync(callback(promiseReturnedValue.unwrap()))
        } else {
          return promiseReturnedValue
        }
      })
    }

    thenOnFailure<Value, NextValue> (callback: (value: Value | Error) => NextValue | Result<NextValue> | Promise<Result<NextValue>>): NextValue | Result<NextValue> | Promise<Result<NextValue>> {
      return this.then(promiseReturnedValue => {
        if (promiseReturnedValue instanceof Result && promiseReturnedValue.isFailure()) {
          return wrapValueInResultAsync(callback(promiseReturnedValue.value))
        } else {
          return promiseReturnedValue
        }
      })
    }
  }

  // PromiseConstructor.resolveFromSuccess = function<Value> (value: Value): Result<Value>
  //
  // // interface PromiseConstructor.resolveFromSuccess = function<Value> (value: Value): Result<Value>
  //
  // promise.prototype.thenOnSuccess = function<Value, NextValue> (callback: (value: Value | Error) => NextValue | Result<NextValue> | Promise<Result<NextValue>>): NextValue | Result<NextValue> | Promise<Result<NextValue>> {
  //   return this.then((promiseReturnedValue: Result<Value> | Value) => {
  //     if (promiseReturnedValue instanceof Result && promiseReturnedValue.isSuccess()) {
  //       return wrapValueInResultAsync(callback(promiseReturnedValue.unwrap()))
  //     } else {
  //       return promiseReturnedValue
  //     }
  //   })
  // }
  //
  // promise.prototype.thenOnFailure = function<Value, NextValue> (callback: (value: Value | Error) => NextValue | Result<NextValue> | Promise<Result<NextValue>>): NextValue | Result<NextValue> | Promise<Result<NextValue>> {
  //   return this.then((promiseReturnedValue: Result<Value> | Value) => {
  //     if (promiseReturnedValue instanceof Result && promiseReturnedValue.isFailure()) {
  //       return wrapValueInResultAsync(callback(promiseReturnedValue.value))
  //     } else {
  //       return promiseReturnedValue
  //     }
  //   })
  // }
  //
  // promise.resolveFromSuccess = function<Value> (value: Value): Result<Value> {
  //   return promise.resolve(Success(value))
  // }
  //
  // promise.resolveFromFailure = function<Value> (value: Error): Result<Value> {
  //   return promise.resolve(Failure(value as Error))
  // }

  promise = new ResultPromise(undefined)
}
