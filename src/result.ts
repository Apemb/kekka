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
  Cannot use reduce, since reduce in Typescript assume that you work on an array of elements all having the same type
   */
  static merge<Value>  (results: Result<Value>[]): Result<Value[]> | Result<Value> {
    return results.reduce((resultOfMerge: Result<Value> | Result<Value[]>, currentResult: Result<Value>) => {
      if (currentResult.isSuccess()) {
        return (resultOfMerge as Result<Value[]>).onSuccess( (mergedResultValues) => {
            mergedResultValues.push(currentResult.unwrap())
          return mergedResultValues
        })
      } else if (currentResult.isFailure() && resultOfMerge.isSuccess()) {
        return currentResult
      }
      return resultOfMerge
    }, Result.fromSuccess([]))
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

  onSuccess<NextValue> (callback: (value: Value) => NextValue | Result<NextValue>): Result<NextValue | Value> {
    if (this.isSuccess()) {
      const returnedValue: NextValue | Result<NextValue> = callback(this._value as Value)

      if (isResult(returnedValue)) {
        return returnedValue
      } else {
        return Result.fromSuccess(returnedValue as NextValue)
      }
    } else {
      return this
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

export function isResult(obj: any | null | undefined): obj is Result<never> {
  return !(obj === undefined || obj === null) && obj.kekkaPublicApiVersion === KEKKA_API_VERSION
}

export const Success = Result.fromSuccess
export const Failure = Result.fromFailure
