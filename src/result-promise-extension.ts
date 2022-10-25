import {Failure, Result, Success} from "./result";

type promiseSuccessCallback<T, U> = (value: T) => U | Result<U> | Promise<Result<U>>

declare global {
  interface Promise<T> {
    thenOnSuccess<U>(callback: T extends Result<infer V> ? promiseSuccessCallback<V, U> : promiseSuccessCallback<unknown, U>): T extends Result<unknown> ? Promise<Result<U>> : Promise<T>

    thenOnFailure<U>(callback: (value: Error) => U | Result<U> | Promise<Result<U>>): Promise<T> | Promise<Result<U>>
  }

  interface PromiseConstructor {
    resolveFromSuccess<U>(value: U): Promise<Result<U>>

    resolveFromFailure<U>(value: Error): Promise<Result<U>>
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


Promise.prototype.thenOnSuccess = function (callback) {
  return this.then((promiseReturnedValue) => {
    if (promiseReturnedValue instanceof Result && promiseReturnedValue.isSuccess()) {
      return wrapValueInResultAsync(callback(promiseReturnedValue.unwrap()))
    } else {
      return promiseReturnedValue
    }
  })
}

Promise.prototype.thenOnFailure = function (callback) {
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
