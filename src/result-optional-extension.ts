import {Failure, Result, Success} from './result'
import {Optional} from './optional'

declare module './optional' {
  interface Optional<Value> {
    toResult(failure: Error): Result<Value>
  }
}

Optional.prototype.toResult = function <Value>(failure: Error): Result<Value> {
  return this
    .map((value) => Success(value))
    .orElse(Failure(failure))
}
