import {Failure, Result, Success} from './result'
import {Empty, Optional} from './optional'

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

declare module './result' {
  interface Result<Value> {
    toOptional(): Optional<Value>
  }
}

Result.prototype.toOptional = function <Value>(): Optional<Value> {
  if (this.isFailure()) {
    return Empty<Value>()
  }

  const associatedValue = this.unwrap()

  return Optional.ofNullable(associatedValue)
}
