import { describe, it, expect } from 'vitest'
import { thrownBy } from './test-helper'
import {Empty, isOptional, Optional, Some} from '../src/optional'
import {Success, Failure} from '../src/result'

describe('Optional', () => {

  describe('ofNullable', () => {
    it('should return a full optional if value is not nullable', () => {
      const value = 'some value'
      const optional = Optional.ofNullable(value)

      expect(optional.isSome()).toBe(true)
    })

    it('should return an empty optional if value is undefined', () => {
      const value = undefined
      const optional = Optional.ofNullable<string>(value)

      expect(optional.isSome()).toBe(false)
    })

    it('should return an empty optional if value is null', () => {
      const value = null
      const optional = Optional.ofNullable<string>(value)

      expect(optional.isSome()).toBe(false)
    })
  })

  describe('isSome', () => {
    it('should be true if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      expect(some.isSome()).toBe(true)
    })

    it('should be false if optional is empty', () => {
      const empty = Empty<string>()

      expect(empty.isSome()).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('should be false if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      expect(some.isEmpty()).toBe(false)
    })

    it('should be true if optional is empty', () => {
      const empty = Empty<string>()

      expect(empty.isEmpty()).toBe(true)
    })
  })

  describe('orElse', () => {
    it('should return associated value if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      const backupValue = 'other value'
      expect(some.orElse(backupValue)).toBe(value)
    })

    it('should return function argument if optional is empty', () => {
      const empty = Empty<string>()

      const backupValue = 'other value'
      expect(empty.orElse(backupValue)).toBe(backupValue)
    })
  })

  describe('orElseGet', () => {
    it('should return Promise with associated value if optional has some value', async () => {
      const value = 'some value'
      const some = Some(value)

      const backupValue = 'other value'
      await expect(some.orElseGet(() => Promise.resolve(backupValue))).resolves.toBe(value)
    })

    it('should return function return value if optional is empty', async () => {
      const empty = Empty<string>()

      const backupValue = 'other value'
      await expect(empty.orElseGet(() => Promise.resolve(backupValue))).resolves.toBe(backupValue)
    })
  })

  describe('orElseThrow', () => {
    it('should return associated value if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      const error = new Error('some error')
      expect(some.orElseThrow(error)).toBe(value)
    })

    it('should throw error if optional is empty', () => {
      const empty = Empty<string>()

      const error = new Error('some error')
      expect(thrownBy(() => empty.orElseThrow(error))).toBe(error)
    })
  })

  describe('map', () => {
    it('should not run callback and return Empty if start optional is Empty', () => {
      const empty = Empty<string>()
      const mapFunction = (value: string) => value + ' and again'

      const returnedOptional = empty.map(mapFunction)

      expect(isOptional(returnedOptional)).toBe(true)
      expect(returnedOptional.isEmpty()).toBe(true)
    })

    it('should run callback with unwrapped value and return Some with callback result if result not undef or null', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const mapFunction = (value: string) => value + ' and again'

      const returnedOptional = some.map(mapFunction)

      const expectedValue = 'some value and again'
      expect(isOptional(returnedOptional)).toBe(true)
      expect(returnedOptional.orElse('something else')).toBe(expectedValue)
    })

    it('should run callback and return Empty with callback result if result is undef', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const mapFunction = () => undefined

      const returnedOptional = some.map(mapFunction)

      expect(isOptional(returnedOptional)).toBe(true)
      expect(returnedOptional.isEmpty()).toBe(true)
    })

    it('should run callback and return Empty with callback result if result is null', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const mapFunction = () => null

      const returnedOptional = some.map(mapFunction)

      expect(isOptional(returnedOptional)).toBe(true)
      expect(returnedOptional.isEmpty()).toBe(true)
    })

    it('should run callback with unwrapped value and return Some with callback result if result is Optional with associated value', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const otherValue = 'Other better value'
      const otherSome = Some(otherValue)
      const mapFunction = () => otherSome

      const returnedOptional = some.map(mapFunction)

      expect(isOptional(returnedOptional)).toBe(true)
      expect(returnedOptional.orElse('something else')).toBe(otherValue)
    })

    it('should run callback with unwrapped value and return Empty with callback result if result is Empty Optional', () => {
      const initialValue = 'some value'
      const some = Some(initialValue)
      const otherEmpty = Empty<string>()
      const mapFunction = () => otherEmpty

      const returnedOptional = some.map(mapFunction)

      expect(isOptional(returnedOptional)).toBe(true)
      expect(returnedOptional.isEmpty()).toBe(true)
    })
  })

  describe('toResult', () => {
    it('should return Success with value if optional has some value', () => {
      const value = 'some value'
      const some = Some(value)

      const error = new Error('some error')
      const result = Success(value)
      expect(some.toResult(error)).toStrictEqual(result)
    })

    it('should return Failure if optional is empty', () => {
      const empty = Empty()

      const error = new Error('some error')
      const result = Failure(error)
      expect(empty.toResult(error)).toStrictEqual(result)
      // toStrictEqual compare les Error par message : sans ceci, une copie passerait.
      expect(thrownBy(() => empty.toResult(error).unwrap())).toBe(error)
    })
  })
})

describe('isOptional', () => {
  it('should be true if obj is an optional with value', () => {
    const value = 'some value'
    const optional = Some(value)

    expect(isOptional(optional)).toBe(true)
  })

  it('should be true if obj is an empty optional', () => {
    const emptyOptional = Empty<string>()

    expect(isOptional(emptyOptional)).toBe(true)
  })


  it('should be false if obj is not an optional', () => {
    const someObject = {a: 'test'}

    expect(isOptional(someObject)).toBe(false)
  })

  it('should be false if obj is a string or an integer', () => {
    expect(isOptional('a string')).toBe(false)
    expect(isOptional(31)).toBe(false)
  })

  it('should be false if obj is a bool', () => {
    expect(isOptional(true)).toBe(false)
    expect(isOptional(false)).toBe(false)
  })

  it('should be false if value is undefined', () => {
    expect(isOptional(undefined)).toBe(false)
  })

  it('should be false if value is null', () => {
    expect(isOptional(null)).toBe(false)
  })

  it('should be false if obj only mimics the api version without the methods', () => {
    expect(isOptional({ kekkaOptionalPublicApiVersion: 4 })).toBe(false)
  })
})
