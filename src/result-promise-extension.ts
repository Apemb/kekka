import {Failure, Result, Success} from "./result";

declare global {
  interface Promise<T> {
    thenOnSuccess<NextValue>(callback: (value: T) => NextValue | Result<NextValue> | Promise<Result<NextValue>>): Promise<T> | Promise<Result<NextValue>>

    thenOnFailure<NextValue>(callback: (value: Error) => NextValue | Result<NextValue> | Promise<Result<NextValue>>): Promise<T> | Promise<Result<NextValue>>
  }

  interface PromiseConstructor {
    resolveFromSuccess<Value>(value: Value): Promise<Result<Value>>

    resolveFromFailure<Value>(value: Error): Promise<Result<Value>>
  }
}

const wrapValueInResult = function <Value>(value: Value | Result<Value>): Result<Value> {
  if (value instanceof Result) {
    return value as Result<Value>
  } else {
    return Success(value) as Result<Value>
  }
}
const wrapValueInResultAsync = function <Value>(value: Value | Result<Value> | Promise<Result<Value>>): Result<Value> | Promise<Result<Value>> {
  if (value instanceof Promise) {
    return value.then(wrapValueInResult) as Promise<Result<Value>>
  } else {
    return wrapValueInResult(value) as Result<Value>
  }
}


Promise.prototype.thenOnSuccess = function <T, NextValue>(callback: (value: T) => NextValue | Result<NextValue> | Promise<Result<NextValue>>): Promise<T> | Promise<Result<NextValue>> {
  return this.then((promiseReturnedValue) => {
    if (promiseReturnedValue instanceof Result && promiseReturnedValue.isSuccess()) {
      return wrapValueInResultAsync(callback(promiseReturnedValue.unwrap()))
    } else {
      return promiseReturnedValue
    }
  })
}

Promise.prototype.thenOnFailure = function <T, NextValue>(callback: (value: Error) => NextValue | Result<NextValue> | Promise<Result<NextValue>>): Promise<T> | Promise<Result<NextValue>> {
  return this.then((promiseReturnedValue) => {
    if (promiseReturnedValue instanceof Result && promiseReturnedValue.isFailure()) {
      return wrapValueInResultAsync(callback(promiseReturnedValue.value))
    } else {
      return promiseReturnedValue
    }
  })
}

Promise.resolveFromSuccess = function <Value>(value: Value): Promise<Result<Value>> {
  return Promise.resolve(Success(value))
}

Promise.resolveFromFailure = function <Value>(value: Error): Promise<Result<Value>> {
  return Promise.resolve(Failure(value))
}
