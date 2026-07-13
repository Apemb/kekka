import { Optional } from './optional'

/**
 * Instead of relying on `result instanceof Result` Kekka will rely on KEKKA_API_VERSION to determine if the
 * object is a Result object and can be processed as such.
 */
const KEKKA_API_VERSION = 4

enum TYPE {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export class Result<Value> {
  public static readonly TYPE = TYPE
  public static readonly kekkaPublicApiVersion = KEKKA_API_VERSION

  private readonly type: TYPE
  private readonly _value?: Value | Error

  private constructor ({ type, value }: { type: TYPE, value?: Value | Error }) {
    this.type = type
    this._value = value
  }

  static fromSuccess<NewValue> (value?: NewValue): Result<NewValue> {
    return new Result({ type: TYPE.SUCCESS, value: value })
  }

  static fromFailure<NewValue> (value: Error): Result<NewValue>  {
    return new Result({ type: TYPE.FAILURE, value: value }) as Result<NewValue>
  }

  /*
  Merges an array of Results into a single Result of an array. Keeps the first failure encountered.
  The explicit reduce accumulator type is needed because TypeScript infers it from the seed otherwise.
   */
  static merge<Value> (results: Result<Value>[]): Result<Value[]> {
    return results.reduce<Result<Value[]>>((resultOfMerge, currentResult) => {
      if (currentResult.isFailure()) {
        return resultOfMerge.isFailure() ? resultOfMerge : (currentResult as unknown as Result<Value[]>)
      }
      return resultOfMerge.onSuccess((mergedResultValues) => [...mergedResultValues, currentResult.unwrap()])
    }, Result.fromSuccess<Value[]>([]))
  }

  isSuccess (): boolean {
    return this.type === TYPE.SUCCESS
  }

  isFailure (): boolean {
    return this.type === TYPE.FAILURE
  }

  unwrap (): Value {
    if (this.isFailure()) {
      throw this._value
    }
    return this._value as Value
  }

  onSuccess<NextValue> (callback: (value: Value) => NextValue | Result<NextValue>): Result<NextValue> {
    if (this.isSuccess()) {
      const returnedValue: NextValue | Result<NextValue> = callback(this._value as Value)

      if (isResult(returnedValue)) {
        return returnedValue
      } else {
        return Result.fromSuccess(returnedValue as NextValue)
      }
    } else {
      return this as unknown as Result<NextValue>
    }
  }

  onFailure <NextValue> (callback: (value: Error) => NextValue | Result<NextValue>): Result<NextValue | Value> {
    if (this.isFailure()) {
      const returnedValue: NextValue | Result<NextValue> = callback(this._value as Error)

      if (isResult(returnedValue)) {
        return returnedValue
      } else {
        return Result.fromSuccess(returnedValue as NextValue)
      }
    } else {
      return this
    }
  }

  toOptional (): Optional<Value> {
    if (this.isFailure()) {
      return Optional.empty<Value>()
    }
    return Optional.ofNullable(this.unwrap())
  }

  toString (): string {
    if (this.isSuccess()) {
      return `[Result-Success (${this._value})]`
    } else if (this.isFailure()) {
      return `[Result-Failure (${this._value})]`
    } else {
      return `[Result (${this.type} - ${this._value})]`
    }
  }

  inspect (): string {
    return this.toString()
  }

  get kekkaPublicApiVersion (): number {
    return KEKKA_API_VERSION
  }

  get value(): Error | Value | undefined {
    return this._value
  }
}

export function isResult(obj: unknown): obj is Result<never> {
  if (obj === undefined || obj === null) {
    return false
  }
  const candidate = obj as { kekkaPublicApiVersion?: unknown, isSuccess?: unknown }
  return candidate.kekkaPublicApiVersion === KEKKA_API_VERSION &&
    typeof candidate.isSuccess === 'function'
}

export const Success = Result.fromSuccess
export const Failure = Result.fromFailure
