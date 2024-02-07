/**
 * Instead of relying on `obj instanceof Optional` Kekka will rely on KEKKA_OPTIONAL_API_VERSION to determine if the
 * object is a Optional object and can be processed as such.
 */
const KEKKA_OPTIONAL_API_VERSION = 4

enum TYPE {
  SOME = 'SOME',
  EMPTY = 'EMPTY'
}

const Nothing = Symbol('Nothing')

type mapFunctionCallback<T, U> = (value: T) => undefined | null | U | Optional <U>

export class Optional<Value> {
  public static readonly TYPE = TYPE
  public static readonly kekkaOptionalPublicApiVersion = KEKKA_OPTIONAL_API_VERSION

  private readonly type: TYPE
  private readonly _value: Value | typeof Nothing

  private constructor({ type, value }: { type: TYPE, value: Value }) {
    this.type = type
    this._value = value
  }

  static of<NewValue>(value: NewValue): Optional<NewValue> {
    return new Optional({ type: TYPE.SOME, value: value })
  }

  static empty<NewValue>(): Optional<NewValue> {
    return new Optional({ type: TYPE.EMPTY, value: Nothing }) as Optional<NewValue>
  }

  static ofNullable<NewValue>(value: NewValue | undefined | null): Optional<NewValue> {
    if (value === undefined || value === null) {
      return Optional.empty()
    } else {
      return Optional.of(value)
    }
  }

  isSome(): boolean {
    return this.type === TYPE.SOME
  }

  isEmpty(): boolean {
    return this.type === TYPE.EMPTY
  }

  orElse(backupValue: Value): Value {
    if (this.isSome()) {
      return this._value as Value
    } else {
      return backupValue
    }
  }

  orElseGet(callback: () => Promise<Value>): Promise<Value> {
    if (this.isSome()) {
      return Promise.resolve(this._value as Value)
    } else {
      return callback()
    }
  }

  orElseThrow(error: Error): Value {
    if (this.isSome()) {
      return this._value as Value
    } else {
      throw error
    }
  }

  map<NextValue>(callback: mapFunctionCallback<Value, NextValue>): Optional<NextValue> {
    if (this.isEmpty()) {
      return Optional.empty()
    }

    const returnedValue = callback(this._value as Value)

    if (isOptional(returnedValue)) {
      return returnedValue
    }

    return Optional.ofNullable<NextValue>(returnedValue as undefined | null | NextValue)
  }

  toString(): string {
    if (this.isSome()) {
      return `[Optional-Some (${ String(this._value) })]`
    } else if (this.isEmpty()) {
      return `[Optional-Empty (${ String(this._value) })]`
    } else {
      return `[Optional (${ this.type } - ${ String(this._value) })]`
    }
  }

  inspect(): string {
    return this.toString()
  }

  get kekkaOptionalPublicApiVersion(): number {
    return KEKKA_OPTIONAL_API_VERSION
  }
}

export function isOptional(obj: any): obj is Optional<never> {
  return !(obj === undefined || obj === null) && obj.kekkaOptionalPublicApiVersion === KEKKA_OPTIONAL_API_VERSION
}

export const Some = Optional.of
export const Empty = Optional.empty
