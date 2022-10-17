enum TYPE {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export class Result<Value> {
  public static readonly TYPE = TYPE

  private type: TYPE
  private _value: Value | Error

  constructor ({ type, value }: { type: TYPE, value: Value | Error }) {
    this.type = type
    this._value = value
  }

  static fromSuccess<NewValue> (value: NewValue): Result<NewValue> {
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

      if (returnedValue instanceof Result) {
        return returnedValue
      } else {
        return Result.fromSuccess(returnedValue)
      }
    } else {
      return this
    }
  }

  onFailure <NextValue> (callback: (value: Error) => NextValue | Result<NextValue>): Result<NextValue | Value> {
    if (this.isFailure()) {
      const returnedValue: NextValue | Result<NextValue> = callback(this._value as Error)

      if (returnedValue instanceof Result) {
        return returnedValue
      } else {
        return Result.fromSuccess(returnedValue)
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

  get value(): Error | Value {
    return this._value;
  }
}

export const Success = Result.fromSuccess
export const Failure = Result.fromFailure
